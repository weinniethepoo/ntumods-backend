terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      version = "~> 3.98.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "cz4052"
  location = "southeastasia"
}

variable "docker_hub_username" {}
variable "docker_hub_password" {}

resource "azurerm_container_group" "acg" {
  name                = "ntumods-backend"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  restart_policy      = "OnFailure"
  dns_name_label      = "ntumods-backend"

  container {
    name   = "ntumods-scraper"
    image  = "xinweilau/myrepopo:ntumods-backend"
    cpu    = 0.25
    memory = 0.5

    ports {
      port     = 8080
      protocol = "TCP"
    }
  }

  image_registry_credential {
    server   = "index.docker.io"
    username = var.docker_hub_username
    password = var.docker_hub_password
  }
}
