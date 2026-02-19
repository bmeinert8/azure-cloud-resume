# 1. Configure the Azure Provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# 2. Create the Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "azure-resume-rg"
  location = "centralus"
}

# 3. Create the Storage Account
resource "azurerm_storage_account" "sa" {
  name                     = "briansresume440395"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  # Enable Static Website Hosting
  static_website {
    index_document     = "index.html"
    error_404_document = "404.html"
  }
}

# 4. Output the Website URL
output "website_url" {
  value = azurerm_storage_account.sa.primary_web_endpoint
}

# 5. Create Cosmos DB Account (Serverless Mode)
resource "azurerm_cosmosdb_account" "db" {
  name                = "brians-resume-db-440395"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  enable_free_tier    = true 
  # Note: Free tier might not apply to Serverless mode specifically, 
  # but Serverless is cheap anyway. 
  
  capabilities {
    name = "EnableServerless"
  }

  consistency_policy {
    consistency_level       = "Session"
    max_interval_in_seconds = 5
    max_staleness_prefix    = 100
  }

  geo_location {
    location          = azurerm_resource_group.rg.location
    failover_priority = 0
  }
}

# 6. Create the SQL Database inside the Account
resource "azurerm_cosmosdb_sql_database" "sql_db" {
  name                = "AzureResume"
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.db.name
}

# 7. Create the Container (Table)
resource "azurerm_cosmosdb_sql_container" "container" {
  name                  = "Counter"
  resource_group_name   = azurerm_resource_group.rg.name
  account_name          = azurerm_cosmosdb_account.db.name
  database_name         = azurerm_cosmosdb_sql_database.sql_db.name
  partition_key_path    = "/id"
}