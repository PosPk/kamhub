variable "cloud_id" {
  type        = string
  description = "Yandex Cloud ID"
}

variable "folder_id" {
  type        = string
  description = "Yandex Folder ID"
}

variable "zone" {
  type        = string
  description = "Default zone (e.g. ru-central1-a)"
  default     = "ru-central1-a"
}
