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

# Create the Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "azure-resume-rg"
  location = "centralus"
}


# Create Cosmos DB Account (Serverless Mode)
resource "azurerm_cosmosdb_account" "db" {
  name                = "brians-resume-db-440395"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  free_tier_enabled    = true 
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

# Create the SQL Database inside the Account
resource "azurerm_cosmosdb_sql_database" "sql_db" {
  name                = "AzureResume"
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.db.name
}

# Create the Container (Table)
resource "azurerm_cosmosdb_sql_container" "container" {
  name                  = "Counter"
  resource_group_name   = azurerm_resource_group.rg.name
  account_name          = azurerm_cosmosdb_account.db.name
  database_name         = azurerm_cosmosdb_sql_database.sql_db.name
  partition_key_paths    = ["/id"]
}

# Storage Account for the Function App
resource "azurerm_storage_account" "func_sa" {
  name                     = "brianfuncsa440395"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# App Service Plan (Serverless Consumption Plan)
resource "azurerm_service_plan" "app_plan" {
  name                = "brian-resume-app-plan"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "Y1" # Y1 is the dynamic/serverless tier
}

# The Python Function App
resource "azurerm_linux_function_app" "func_app" {
  name                       = "brian-resume-api-440395"
  resource_group_name        = azurerm_resource_group.rg.name
  location                   = azurerm_resource_group.rg.location
  service_plan_id            = azurerm_service_plan.app_plan.id
  storage_account_name       = azurerm_storage_account.func_sa.name
  storage_account_access_key = azurerm_storage_account.func_sa.primary_access_key

  site_config {
    application_stack {
      python_version = "3.12" # Update this to local Python version if needed
    }
    cors {
      allowed_origins = [
        "https://bmeinert.com",
        "https://www.bmeinert.com",
        "https://black-coast-0335f4310.2.azurestaticapps.net"
      ] 
    }
  }

  app_settings = {
    # Terraform magically injects the connection string here! No copy-pasting required.
    "CosmosDbConnectionString" = azurerm_cosmosdb_account.db.primary_sql_connection_string
    "AzureWebJobsFeatureFlags" = "EnableWorkerIndexing" # Required for the Python V2 model
  }

  lifecycle {
    ignore_changes = [
      site_config[0].application_insights_connection_string,
      site_config[0].application_insights_key,
      tags["hidden-link: /app-insights-resource-id"],
      sticky_settings
    ]
  }
}

# Output the Live API URL
output "api_url" {
  value = "https://${azurerm_linux_function_app.func_app.default_hostname}/api/GetResumeCounter"
}

# Storage Queue for Contact Messages
resource "azurerm_storage_queue" "contact_queue" {
  name                 = "contactmessages"
  storage_account_name = azurerm_storage_account.func_sa.name
}

# Logic App Serverless Consumption Plan for Notifications
resource "azurerm_logic_app_workflow" "email_notifier" {
  name                = "brian-contact-notifier-440395"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  lifecycle {
    ignore_changes = [
      parameters,
      workflow_parameters,
      identity,
      tags
    ]
  }
}
# Static Web App for the Frontend
resource "azurerm_static_web_app" "resume_frontend" {
  name                = "bmeinert-portfolio-app"
  resource_group_name = azurerm_resource_group.rg.name
  location            = "centralus" # Match the region you deployed it to
  sku_tier            = "Free"
  sku_size            = "Free"
}