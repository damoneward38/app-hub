# PASTE THIS COMMAND INTO YOUR TERMINAL TO QUERY THE VAULT
psql -d empire_foundation -c "SELECT SUM(amount) as total_vault_value FROM trade_ledger WHERE status = 'COMPLETED';"