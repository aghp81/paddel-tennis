'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import './booking.css';

type Court = { id: string; name: string; sport: string; pricePerHour: number };
type Club = { name: string; city: string; district?: string; address?: string; phone?: string; description?: string; courts: Court[] };
type Slot = { startsAt: string; endsAt: string; price: number };
const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const money = (n: number) => new Intl.NumberFormat('fa-IR').format(n);

export default function ReserveCourtPage() {
  const { slug } = useParams<{ slug: string }>();
  const [club, setClub] = useState<Club | null>(null);
  const [courtId, setCourtId] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Tehran' }));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { fetch(`${api}/courts/club/${slug}`).then(r => r.ok ? r.json() : null).then((data: Club | null) => { setClub(data); if (data?.courts[0]) setCourtId(data.courts[0].id); }).catch(() => setMessage('ارتباط با سرور برقرار نشد.')); }, [slug]);
  useEffect(() => { if (!courtId || !date) return; setSelected(null); fetch(`${api}/courts/${courtId}/availability?date=${date}`).then(r => r.ok ? r.json() : []).then(setSlots).catch(() => setSlots([])); }, [courtId, date]);

  async function reserve() {
    if (!selected) return;
    setBusy(true); setMessage('');
    try {
      const response = await fetch(`${api}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courtId, startsAt: selected.startsAt, name, phone }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'ثبت رزرو انجام نشد');
      setMessage(`درخواست رزرو ثبت شد. مبلغ ${money(data.totalPrice)} تومان؛ سانس تا ۱۰ دقیقه برای شما نگه داشته می‌شود.`);
      setSelected(null);
    } catch (e) { setMessage(e instanceof Error ? e.message : 'خطا در ثبت رزرو'); }
    finally { setBusy(false); }
  }

  return <main className="booking-page" dir="rtl"><a className="brand" href="/">ورزشا</a>{!club ? <p>در حال دریافت اطلاعات باشگاه…</p> : <>
    <div className="booking-cover"><span>🎾</span><div><small>{club.city}{club.district ? `، ${club.district}` : ''}</small><h1>{club.name}</h1><p>{club.address || club.description || 'زمین مناسب بازی بعدی‌ات را انتخاب کن.'}</p></div></div>
    <section className="booking-panel"><h2>انتخاب زمین و سانس</h2><label>زمین<select value={courtId} onChange={e => setCourtId(e.target.value)}>{club.courts.map(c => <option key={c.id} value={c.id}>{c.name} · {c.sport === 'PADEL' ? 'پدل' : 'تنیس'} · {money(c.pricePerHour)} تومان/ساعت</option>)}</select></label>
      <label>تاریخ بازی<input type="date" min={new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tehran' })} value={date} onChange={e => setDate(e.target.value)} /></label>
      <h3>سانس‌های آزاد</h3><div className="slot-grid">{slots.map(slot => <button key={slot.startsAt} className={selected?.startsAt === slot.startsAt ? 'slot selected' : 'slot'} onClick={() => setSelected(slot)}>{new Date(slot.startsAt).toLocaleTimeString('fa-IR', { timeZone: 'Asia/Tehran', hour: '2-digit', minute: '2-digit' })}<small>{money(slot.price)} تومان</small></button>)}</div>
      {!slots.length && <p className="booking-muted">برای این تاریخ سانس آزادی ثبت نشده است.</p>}
    </section>
    {selected && <section className="booking-panel"><h2>اطلاعات رزرو</h2><p>زمان انتخاب‌شده: {new Date(selected.startsAt).toLocaleString('fa-IR', { timeZone: 'Asia/Tehran', dateStyle: 'medium', timeStyle: 'short' })} · {money(selected.price)} تومان</p><div className="booking-fields"><label>نام و نام خانوادگی<input value={name} onChange={e => setName(e.target.value)} required /></label><label>شماره تماس<input type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="09…" required /></label></div><button className="booking-submit" disabled={busy || !name.trim() || phone.length < 8} onClick={reserve}>{busy ? 'در حال ثبت…' : 'ثبت درخواست رزرو'}</button><p className="booking-muted">در این نسخه پرداخت آنلاین فعال نیست؛ سانس پس از ثبت درخواست برای ۱۰ دقیقه نگه داشته می‌شود.</p></section>}
    {message && <p className="booking-message" role="status">{message}</p>}
  </>}</main>;
}
