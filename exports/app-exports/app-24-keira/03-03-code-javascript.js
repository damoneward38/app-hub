/* KEIRA INTERFACE: ARCHITECT ACCESS */
const getVaultStatus = async () => {
    const res = await pool.query("SELECT SUM(amount) as total FROM trade_ledger WHERE status = 'COMPLETED'");
    console.log(`👑 [VAULT-REPORT] Architect, the vault holds: $${res.rows[0].total}`);
};

// Interface command
if (process.argv[2] === "vault") {
    getVaultStatus();
}