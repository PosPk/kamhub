terraform {
  required_version = ">= 1.6.0"
  required_providers {
    yandex = {
      source  = "yandex-cloud/yandex"
      version = ">= 0.110.0"
    }
  }
  # Бэкенд состояния рекомендуем настроить через backend.hcl (пример в README)
}
