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
  region {
    default = "us-east-1"
  }
  ip_all {
    default = "0.0.0.0/0"
  }
  ip_kevin {
    default = "62.163.187.106/32"
  }
  ip_marius {
    default = "84.146.5.70/32"
  }
  ip_tim {
    default = "24.134.75.132/32"
  }
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
    "Name" = "${var.FREY_DOMAIN}"
  }
  provisioner "remote-exec" {
    inline = ["sudo pwd"]
    connection {
      key_file = "{{{config.global.ssh.privatekey_file}}}"
      user     = "{{{config.global.ssh.user}}}"
    }
  }
}

infra resource "aws_route53_record" www {
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
}

install {
  playbooks {
    hosts = "uppy-server"
    name  = "Install uppy-server"
    roles {
      role         = "{{{init.paths.roles_dir}}}/apt/v1.0.0"
      apt_packages = ["apg", "build-essential", "curl", "git-core", "htop", "iotop", "libpcre3", "logtail", "mlocate", "mtr", "mysql-client", "psmisc", "telnet", "vim", "wget"]
    }
    roles {
      role = "{{{init.paths.roles_dir}}}/unattended-upgrades/v1.2.0"
    }
    tasks {
      name = "Common | Add convenience shortcut wtf"
      lineinfile {
        dest = "/home/ubuntu/.bashrc"
        line = "alias wtf='sudo tail -f /var/log/*{log,err} /var/log/{dmesg,messages,*{,/*}{log,err}}'"
      }
    }
  }
}

setup {
  playbooks {
    hosts = "uppy-server"
    name  = "Setup uppy-server"
    roles {
      role           = "{{{init.paths.roles_dir}}}/nodejs/v2.1.1"
      nodejs_version = "4.x"
    }
    roles {
      role                  = "{{{init.paths.roles_dir}}}/upstart/v1.0.0"
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
      role = "{{{init.paths.roles_dir}}}/rsyslog/v3.0.1"
      rsyslog_rsyslog_d_files "49-uppy-server" {
        directives = ["& stop"]
        rules {
          rule    = ":programname, startswith, '{{{config.global.appname}}}'"
          logpath = "{{{config.global.approot}}}/shared/logs/{{{config.global.appname}}}.log"
        }
      }
    }
    tasks {
      hostname = "name={{lookup('env', 'FREY_DOMAIN')}}"
      name     = "uppy-server | Set hostname"
    }
    tasks {
      file = "path=/mnt/uppy-server-data state=directory owner=www-data group=ubuntu mode=0755 mode=ug+rwX,o= recurse=yes"
      name = "uppy-server | Create uppy data dir"
    }
  }
}

deploy {
  playbooks {
    hosts = "uppy-server"
    name  = "Deploy uppy-server"
    roles {
      role                     = "{{{init.paths.roles_dir}}}/deploy/v1.3.0"
      ansistrano_deploy_from   = "{{{init.cliargs.projectDir}}}"
      ansistrano_deploy_to     = "/srv/uppy-server"
      ansistrano_shared_paths  = ["logs"]
      ansistrano_deploy_via    = "git"
      ansistrano_keep_releases = 10
      ansistrano_git_repo      = "https://github.com/transloadit/uppy-server.git"
    }
    tasks {
      file = "path=/srv/uppy-server/shared/logs state=directory owner=syslog group=ubuntu mode=ug+rwX,o= recurse=yes"
      name = "uppy-server | Create and chown shared log dir"
    }
    tasks {
      copy = "src=../env.sh dest=/srv/uppy-server/current/env.sh mode=0600 owner=root group=root"
      name = "uppy-server | Upload environment"
    }
    tasks {
      npm  = "path=/srv/uppy-server/current production=yes"
      name = "uppy-server | Install node modules"
    }
  }
}

restart {
  playbooks {
    hosts = "uppy-server"
    name  = "Restart uppy-server"
    tasks {
      shell = "iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3020"
      name  = "uppy-server | Redirect HTTP traffic to uppy-server"
    }
    tasks {
      action = "service name=uppy-server state=restarted"
      name   = "uppy-server | Restart"
    }
  }
}
