resource "yandex_vpc_network" "main" {
  name = "kamhub-net"
}

resource "yandex_vpc_subnet" "app" {
  name           = "kamhub-subnet-app"
  zone           = var.zone
  network_id     = yandex_vpc_network.main.id
  v4_cidr_blocks = ["10.0.1.0/24"]
}

resource "yandex_vpc_subnet" "db" {
  name           = "kamhub-subnet-db"
  zone           = var.zone
  network_id     = yandex_vpc_network.main.id
  v4_cidr_blocks = ["10.0.2.0/24"]
}
