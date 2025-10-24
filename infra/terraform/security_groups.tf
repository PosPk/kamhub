resource "yandex_vpc_security_group" "web" {
  name       = "kamhub-web"
  network_id = yandex_vpc_network.main.id

  ingress {
    protocol       = "tcp"
    port           = 80
    description    = "HTTP"
    v4_cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    protocol       = "tcp"
    port           = 443
    description    = "HTTPS"
    v4_cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    protocol       = "any"
    description    = "All outbound"
    v4_cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "yandex_vpc_security_group" "db" {
  name       = "kamhub-db"
  network_id = yandex_vpc_network.main.id

  ingress {
    protocol       = "tcp"
    port           = 6432
    description    = "PostgreSQL (public TEMP)"
    v4_cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    protocol       = "any"
    description    = "All outbound"
    v4_cidr_blocks = ["0.0.0.0/0"]
  }
}
