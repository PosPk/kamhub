output "network_id" {
  value = yandex_vpc_network.main.id
}

output "subnet_app_id" {
  value = yandex_vpc_subnet.app.id
}

output "subnet_db_id" {
  value = yandex_vpc_subnet.db.id
}
