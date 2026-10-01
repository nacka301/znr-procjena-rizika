import { useMemo, useState } from "react";
import { PRILOG_III, type PrilogIIINode } from "../data/prilogIII";
import type { KategorijaRizika } from "../types";

function normaliziraj(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function sadrziPretragu(node: PrilogIIINode, upit: string): boolean {
  if (normaliziraj(node.label).includes(upit)) return true;
  if (node.children) return node.children.some((c) => sadrziPretragu(c, upit));
  return false;
}

function Grana({
  kategorija,
  nodes,
  path,
  upit,
  onOdaberi,
}: {
  kategorija: KategorijaRizika;
  nodes: PrilogIIINode[];
  path: string[];
  upit: string;
  onOdaberi: (kategorija: KategorijaRizika, path: string[]) => void;
}) {
  const [prosireno, setProsireno] = useState<Record<string, boolean>>({});

  return (
    <ul style={{ listStyle: "none", margin: 0, paddingLeft: path.length === 0 ? 0 : 16 }}>
      {nodes
        .filter((n) => !upit || sadrziPretragu(n, upit))
        .map((node) => {
          const noviPath = [...path, node.code];
          const imaDjecu = !!node.children?.length;
          const otvoreno = !!upit || prosireno[node.code];
          return (
            <li key={node.code} style={{ margin: "2px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {imaDjecu ? (
                  <button
                    onClick={() =>
                      setProsireno((p) => ({ ...p, [node.code]: !otvoreno }))
                    }
                    style={{
                      background: "none",
                      border: "none",
                      width: 18,
                      color: "var(--color-text-faint)",
                      cursor: "pointer",
                    }}
                    aria-label={otvoreno ? "Sakrij" : "Prikaži"}
                  >
                    {otvoreno ? "▾" : "▸"}
                  </button>
                ) : (
                  <span style={{ width: 18 }} />
                )}
                <button
                  onClick={() => onOdaberi(kategorija, noviPath)}
                  className="btn btn-sm"
                  style={{
                    border: "none",
                    background: "transparent",
                    textAlign: "left",
                    padding: "2px 6px",
                    fontWeight: imaDjecu ? 600 : 400,
                    flex: 1,
                  }}
                  title="Dodaj kao rizik ovom poslu"
                >
                  <span className="hint" style={{ marginRight: 6 }}>
                    {node.code}
                  </span>
                  {node.label}
                </button>
              </div>
              {imaDjecu && otvoreno && (
                <Grana
                  kategorija={kategorija}
                  nodes={node.children!}
                  path={noviPath}
                  upit={upit}
                  onOdaberi={onOdaberi}
                />
              )}
            </li>
          );
        })}
    </ul>
  );
}

export default function PrilogIIIPicker({
  onOdaberi,
}: {
  onOdaberi: (kategorija: KategorijaRizika, path: string[]) => void;
}) {
  const [upitRaw, setUpitRaw] = useState("");
  const upit = useMemo(() => normaliziraj(upitRaw.trim()), [upitRaw]);

  return (
    <div>
      <input
        type="text"
        value={upitRaw}
        onChange={(e) => setUpitRaw(e.target.value)}
        placeholder="Pretraži Prilog III (npr. buka, pad, kemijske)…"
        style={{
          width: "100%",
          padding: "8px 10px",
          marginBottom: 10,
          border: "1px solid var(--color-border)",
          borderRadius: 6,
        }}
      />
      <div style={{ maxHeight: 360, overflowY: "auto", paddingRight: 4 }}>
        {PRILOG_III.map((grana) => {
          const vidljivo = !upit || grana.djeca.some((n) => sadrziPretragu(n, upit));
          if (!vidljivo) return null;
          return (
            <div key={grana.kategorija} style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: "0.82rem", color: "var(--color-primary-dark)" }}>
                {grana.naslov}
              </h3>
              <Grana
                kategorija={grana.kategorija}
                nodes={grana.djeca}
                path={[]}
                upit={upit}
                onOdaberi={onOdaberi}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
