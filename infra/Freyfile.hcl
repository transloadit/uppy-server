global {
  appname = "uppy-server"
  approot = "/srv/uppy-server"
  ssh {
    key_dir = "./ssh"
  }
  ansiblecfg {
    privilege_escalation {
      become = true
    }
    defaults {
      host_key_checking = "False"
    }
  }
}

infra provider aws {
  access_key = "${var.FREY_AWS_ACCESS_KEY}"
  secret_key = "${var.FREY_AWS_SECRET_KEY}"
  region     = "us-east-1"
}

infra variable {
  amis {
    type = "map"
    default {
      "us-east-1" = "ami-37bde352"
    }
  }
  region { default = "us-east-1" }
  ip_all { default = "0.0.0.0/0" }
}

infra output public_address {
  value = "${aws_instance.uppy-server.0.public_dns}"
}

infra output public_addresses {
  value = "${join("\n", aws_instance.uppy-server.*.public_dns)}"
}

infra resource aws_key_pair "uppy-server" {
  key_name   = "uppy-server"
  public_key = "${file("{{{config.global.ssh.publickey_file}}}")}"
}

infra resource aws_instance "uppy-server" {
  ami             = "${lookup(var.amis, var.region)}"
  instance_type   = "c1.medium"
  key_name        = "${aws_key_pair.uppy-server.key_name}"
  security_groups = ["fw-uppy-server"]
  connection {
    key_file = "{{{config.global.ssh.privatekey_file}}}"
    user     = "{{{config.global.ssh.user}}}"
  }
  tags {
    Name = "${var.FREY_DOMAIN}"
  }
  provisioner "remote-exec" {
    inline = ["sudo pwd"]
    connection {
      key_file = "{{{config.global.ssh.privatekey_file}}}"
      user     = "{{{config.global.ssh.user}}}"
    }
  }
}

infra resource aws_route53_record "www" {
  name    = "${var.FREY_DOMAIN}"
  records = ["${aws_instance.uppy-server.public_dns}"]
  ttl     = "300"
  type    = "CNAME"
  zone_id = "${var.FREY_AWS_ZONE_ID}"
}

infra resource aws_security_group "fw-uppy-server" {
  description = "Infra uppy-server"
  name        = "fw-uppy-server"
  ingress {
    cidr_blocks = ["${var.ip_all}"]
    from_port   = 22
    protocol    = "tcp"
    to_port     = 22
  }
  ingress {
    cidr_blocks = ["${var.ip_all}"]
    from_port   = 80
    protocol    = "tcp"
    to_port     = 80
  }
  ingress {
    cidr_blocks = ["${var.ip_all}"]
    from_port   = 443
    protocol    = "tcp"
    to_port     = 443
  }
}

install {
  playbooks {
    hosts = "uppy-server"
    name  = "Install uppy-server"
    pre_tasks {
      name           = "nginx | Add nginx PPA"
      apt_repository = "repo='ppa:nginx/stable'"
    }
    roles {
      role                    = "{{{init.paths.roles_dir}}}/apt/1.3.0"
      apt_manage_sources_list = true
      apt_src_enable          = false
      apt_install             = ["apg", "build-essential", "curl", "git-core", "htop", "iotop", "libpcre3", "logtail", "mlocate", "mtr", "mysql-client", "nginx-light", "psmisc", "telnet", "vim", "wget"]
      apt_install_state       = "present"
    }
    roles {
      role = "{{{init.paths.roles_dir}}}/unattended-upgrades/1.3.0"
    }
    tasks {
      name = "Common | Add convenience shortcut wtf"
      lineinfile {
        dest = "/home/ubuntu/.bashrc"
        line = "alias wtf='sudo tail -f /var/log/*{log,err} /var/log/{dmesg,messages,*{,/*}{log,err}}'"
      }
    }
    tasks {
      name = "Common | Add utf8 local to bashrc to avoid perl warnings"
      lineinfile {
        dest = "/home/ubuntu/.bashrc"
        line = "export LC_ALL=en_US.UTF-8"
      }
    }
  }
}

setup {
  playbooks {
    hosts = "uppy-server"
    name  = "Setup uppy-server"
    roles {
      role           = "{{{init.paths.roles_dir}}}/nodejs/2.1.1"
      nodejs_version = "4.x"
    }
    roles {
      role                  = "{{{init.paths.roles_dir}}}/upstart/1.0.0"
      upstart_command       = "npm run start:production"
      upstart_description   = "uppy-server"
      upstart_name          = "{{{config.global.appname}}}"
      upstart_runtime_root  = "{{{config.global.approot}}}/current"
      upstart_pidfile_path  = "{{{config.global.approot}}}/shared/{{{config.global.appname}}}.pid"
      upstart_respawn       = true
      upstart_respawn_limit = true
      upstart_user          = "www-data"
    }
    roles {
      role = "{{{init.paths.roles_dir}}}/rsyslog/3.1.0"
      rsyslog_rsyslog_d_files "49-uppy-server" {
        directives = ["& stop"]
        rules {
          rule    = ":programname, startswith, \"{{{config.global.appname}}}\""
          logpath = "{{{config.global.approot}}}/shared/logs/{{{config.global.appname}}}.log"
        }
      }
    }
    tasks {
      name     = "uppy-server | Set hostname"
      hostname = "name={{lookup('env', 'FREY_DOMAIN')}}"
    }
    tasks {
      name = "uppy-server | Create uppy data dir"
      file {
        dest    = "/mnt/uppy-server-data"
        state   = "directory"
        owner   = "www-data"
        group   = "ubuntu"
        mode    = "ug+rwX,o="
        recurse = "yes"
      }
    }
    tasks {
      name = "uppy-server | Create public www directory"
      file {
        dest    = "/mnt/nginx-www"
        state   = "directory"
        owner   = "www-data"
        group   = "ubuntu"
        mode    = "ug+rwX,o="
        recurse = "yes"
      }
    }
    tasks {
      name = "uppy-server | Create nginx HTTP configuration"
      template {
        src   = "./templates/default.conf"
        dest  = "/etc/nginx/sites-enabled/default"
        mode  = "ug+rwX,o="
        owner = "root"
        group = "ubuntu"
      }
    }
    tasks {
      name    = "uppy-server | Create DH parameters"
      command = "openssl dhparam -out /etc/nginx/dhparams.pem 2048 creates=/etc/nginx/dhparams.pem"
    }
    tasks {
      name     = "uppy-server | Check if certs where already installed"
      register = "privkey"
      stat {
        path = "/etc/letsencrypt/live/server.uppy.io/privkey.pem"
      }
    }
    tasks {
      // There is a chicken/egg situation where refereing to ssl certs that don't exist yet
      // prevent Nginx to boot, but Nginx is needed to get the certs. So we separate between HTTP/HTTPS here
      // and enable/boot HTTPS later on
      name = "uppy-server | Disable nginx HTTPS configuration"
      when = "not privkey.stat.exists"
      file {
        state = "absent"
        dest  = "/etc/nginx/sites-enabled/https"
      }
    }
    tasks {
      name   = "uppy-server | Restart nginx"
      when   = "not privkey.stat.exists"
      service {
        name  = "nginx"
        state = "restarted"
      }
    }
    tasks {
      name = "uppy-server | Download certbot"
      when = "not privkey.stat.exists"
      get_url {
        url      = "https://raw.githubusercontent.com/certbot/certbot/469b5fd441cae085e922c8e66815b5094747a7c5/certbot-auto"
        dest     = "/opt/certbot-auto"
        checksum = "sha256:6249576909473ffddd945f8574b4035fd4a2be0323f748a650565ae32b9d4971"
        mode     = "ug+rwx,o="
        owner    = "root"
        group    = "ubuntu"
      }
    }
    tasks {
      name    = "uppy-server | Install certbot"
      when    = "not privkey.stat.exists"
      command = "/opt/certbot-auto certonly --no-self-upgrade --non-interactive --webroot --agree-tos --email 'letsencrypt@uppy.io' -w /mnt/nginx-www --domain server.uppy.io"
    }
    tasks {
      name = "uppy-server | Install certbot cronjob"
      when = "not privkey.stat.exists"
      cron {
        name         = "cert-renew"
        special_time = "weekly"
        user         = "ubuntu"
        job          = "/opt/certbot-auto renew --quiet --no-self-upgrade"
      }
    }
    tasks {
      name = "uppy-server | Create nginx HTTPS configuration"
      template {
        src   = "./templates/https.conf"
        dest  = "/etc/nginx/sites-enabled/https"
        mode  = "ug+rwX,o="
        owner = "root"
        group = "ubuntu"
      }
    }
    tasks {
      name = "uppy-server | Restart nginx"
      service {
        name  = "nginx"
        state = "restarted"
      }
    }
  }
}

deploy {
  playbooks {
    hosts = "uppy-server"
    name  = "Deploy uppy-server"
    roles {
      role                          = "{{{init.paths.roles_dir}}}/deploy/1.3.0"
      ansistrano_deploy_from        = "{{{init.cliargs.projectDir}}}/.."
      ansistrano_deploy_to          = "/srv/uppy-server"
      ansistrano_shared_paths       = ["logs"]
      ansistrano_deploy_via         = "rsync"
      ansistrano_rsync_extra_params = "--exclude=.git* --exclude=.DS_Store --exclude=env.* --exclude=node_modules"
      ansistrano_keep_releases      = 10
    }
    tasks {
      name = "uppy-server | Create and chown shared log dir"
      file {
        path    = "/srv/uppy-server/shared/logs"
        state   = "directory"
        owner   = "syslog"
        group   = "ubuntu"
        mode    = "ug+rwX,o="
        recurse = "yes"
      }
    }
    tasks {
      name = "uppy-server | Upload environment"
      copy {
        src   = "../env.sh"
        dest  = "/srv/uppy-server/current/env.sh"
        mode  = "u=rw,go="
        owner = "root"
        group = "root"
      }
    }
    tasks {
      name = "uppy-server | Install node modules"
      npm {
        path       = "/srv/uppy-server/current"
        production = "yes"
      }
    }
  }
}

restart {
  playbooks {
    name  = "Restart"
    hosts = "uppy-server"
    tasks {
      name   = "uppy-server | Restart uppy-server"
      service {
        name  = "uppy-server"
        state = "restarted"
      }
    }
    tasks {
      name   = "uppy-server | Restart nginx"
      service {
        name  = "nginx"
        state = "restarted"
      }
    }
  }
}
