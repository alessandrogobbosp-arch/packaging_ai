import { useMemo, useState } from "react";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import idl from "./packaging_ai.json";
import "@solana/wallet-adapter-react-ui/styles.css";

const network = "https://api.devnet.solana.com";

const MANUAL = `
Manuale manutenzione linea packaging:
- Se la macchina non parte: controllare interruttore di emergenza e alimentazione.
- Se il nastro non avanza: verificare tensione e sensori di posizione.
- Se il prodotto è danneggiato: regolare pressione delle pinze e velocità.
- Errore codice E01: resettare il PLC e verificare i sensori di sicurezza.
`;

function AppContent() {
  const wallet = useWallet();
  const [problem, setProblem] = useState("");
  const [tx, setTx] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const connection = useMemo(() => new web3.Connection(network), []);
  const provider = useMemo(
    () => new AnchorProvider(connection, wallet as any, {}),
    [connection, wallet]
  );
  const program = useMemo(() => new Program(idl as any, provider), [provider]);

  const askGrok = async (userProblem: string) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: userProblem, manual: MANUAL }),
      });
      const data = await response.json();
      setAiResponse(data.answer || "Nessuna risposta");
    } catch (e) {
      setAiResponse("Errore nella richiesta al backend");
    } finally {
      setLoading(false);
    }
  };

  const initializeAccess = async () => {
    if (!wallet.publicKey) {
      alert("Wallet non connesso");
      return;
    }
    try {
      const accessKeypair = web3.Keypair.generate();
      const userPubkey = new web3.PublicKey(wallet.publicKey.toString());
      (provider as any).wallet = { ...wallet, publicKey: userPubkey };

      const sig = await program.methods
        .initializeAccess()
        .accounts({
          access: accessKeypair.publicKey,
          user: userPubkey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([accessKeypair])
        .rpc();
      setTx("Access creato: " + sig);
    } catch (e: any) {
      console.error(e);
      alert("Errore: " + e.message);
    }
  };

  const logSession = async () => {
    if (!wallet.publicKey || !problem) return;
    try {
      const sessionKeypair = web3.Keypair.generate();
      const userPubkey = new web3.PublicKey(wallet.publicKey.toString());

      const sig = await program.methods
        .logSession(problem)
        .accounts({
          session: sessionKeypair.publicKey,
          user: userPubkey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([sessionKeypair])
        .rpc();

      setTx("Sessione loggata: " + sig);
      await askGrok(problem);
      setProblem("");
    } catch (e: any) {
      console.error(e);
      alert("Errore: " + e.message);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "40px",
        maxWidth: "520px",
        width: "100%",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "8px", color: "#1a1a1a" }}>Packaging AI</h1>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "30px", fontSize: "14px" }}>
          Assistente AI per la manutenzione
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
          <WalletMultiButton />
        </div>

        {wallet.publicKey && (
          <>
            <div style={{ background: "#f8f9fa", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px", fontSize: "13px" }}>
              <strong>Wallet:</strong> {wallet.publicKey.toString()}
            </div>

            <button
              onClick={initializeAccess}
              style={{
                width: "100%",
                padding: "12px",
                background: "#6c5ce7",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                cursor: "pointer",
                marginBottom: "30px"
              }}
            >
              Inizializza Access
            </button>

            <h3 style={{ marginBottom: "12px", color: "#333" }}>Logga una sessione</h3>
            <input
              placeholder="Descrivi il problema di packaging"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "15px",
                marginBottom: "12px",
                boxSizing: "border-box"
              }}
            />
            <button
              onClick={logSession}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                background: loading ? "#a29bfe" : "#00b894",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Analisi in corso..." : "Log Session"}
            </button>

            {tx && (
              <p style={{ marginTop: "20px", fontSize: "13px", color: "#555", wordBreak: "break-all", background: "#f1f3f5", padding: "10px", borderRadius: "6px" }}>
                {tx}
              </p>
            )}

            {aiResponse && (
              <div style={{ marginTop: "28px", padding: "16px", background: "#f8f9fa", borderRadius: "10px", border: "1px solid #e9ecef" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#2d3436" }}>Soluzione AI (Grok)</h4>
                <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: "1.5", color: "#2d3436" }}>
                  {aiResponse}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
