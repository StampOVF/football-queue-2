"use client";
import { useCallback, useEffect, useState } from "react";
import { TEAMS } from "../lib/teams";

const fmt = (t) =>
  new Date(t).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function Page() {
  const [bookings, setBookings] = useState([]);
  const [formTeam, setFormTeam] = useState(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings", { cache: "no-store" });
      setBookings(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, [load]);

  async function book(e) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: formTeam, name }),
    });
    setName("");
    setFormTeam(null);
    setBusy(false);
    load();
  }

  async function remove(id) {
    await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main className="wrap">
      <header>
        <div>
          <h1>คิวสวนประดู่ Stadium </h1>
          <p className="sub">
            เลือกทีมแล้วกดจองคิว หน้านี้อัปเดตอัตโนมัติทุก 3 วินาที
          </p>
        </div>
        <p className="total">มีคิวทั้งหมด {bookings.length} คิว</p>
      </header>

      <div className="grid">
        {TEAMS.map((t) => {
          const queue = bookings.filter((b) => b.teamId === t.id);
          const [current, ...waiting] = queue;
          return (
            <section
              key={t.id}
              className="team"
              style={{ "--c": t.color, "--on": t.ink }}
            >
              <div className="top">
                <h2>{t.name}</h2>
                <span className="count">{queue.length} คิว</span>
              </div>

              <div className="now">
                {current ? (
                  <>
                    <span className="label">กำลังเล่น</span>
                    <strong>{current.name}</strong>
                    <button
                      className="ghost"
                      onClick={() => remove(current.id)}
                    >
                      จบคิว
                    </button>
                  </>
                ) : (
                  <p className="empty">ยังไม่มีคิว จองเป็นคิวแรกได้เลย</p>
                )}
              </div>

              <ol className="list">
                {waiting.map((b, i) => (
                  <li key={b.id}>
                    <span className="bib">{i + 1}</span>
                    <span className="who">
                      {b.name}
                      <small>จองเมื่อ {fmt(b.createdAt)}</small>
                    </span>
                    <button className="ghost" onClick={() => remove(b.id)}>
                      ยกเลิก
                    </button>
                  </li>
                ))}
              </ol>

              {formTeam === t.id ? (
                <form onSubmit={book}>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ชื่อผู้จอง"
                    maxLength={40}
                    aria-label="ชื่อผู้จอง"
                  />
                  <div className="row">
                    <button type="submit" className="book" disabled={busy}>
                      ยืนยันจอง
                    </button>
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => setFormTeam(null)}
                    >
                      ปิด
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  className="book"
                  onClick={() => {
                    setFormTeam(t.id);
                    setName("");
                  }}
                >
                  จองคิว{t.name}
                </button>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
