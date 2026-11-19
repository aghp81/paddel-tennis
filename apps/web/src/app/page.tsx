'use client';

import { useEffect, useState } from 'react';

type Court = { id: string; slug: string; name: string; city: string; district: string; sport: 'TENNIS' | 'PADEL'; surface: string; rating: number; price: number; nextSlot: string };
type Player = { id: string; name: string; city: string; sport: string; level: string; availability: string; avatar: string };

const fallbackCourts: Court[] = [
  { id: '1', slug: 'olympic-tennis', name: 'باشگاه تنیس المپیک', city: 'تهران', district: 'شهرک غرب', sport: 'TENNIS', surface: 'زمین روباز', rating: 4.8, price: 350000, nextSlot: 'امروز، ۱۸:۰۰' },
  { id: '2', slug: 'aftab-padel', name: 'پدل سنتر آفتاب', city: 'تهران', district: 'سعادت‌آباد', sport: 'PADEL', surface: 'زمین شیشه‌ای', rating: 4.9, price: 500000, nextSlot: 'امروز، ۲۰:۰۰' },
  { id: '3', slug: 'spin-academy', name: 'آکادمی اسپین', city: 'اصفهان', district: 'مرداویج', sport: 'TENNIS', surface: 'زمین سرپوشیده', rating: 4.7, price: 300000, nextSlot: 'فردا، ۱۷:۰۰' },
];
const players: Player[] = [
  { id: '1', name: 'آرمان رضایی', city: 'تهران', sport: 'تنیس', level: 'متوسط', availability: 'عصرها', avatar: '👨🏻' },
  { id: '2', name: 'نگار محمدی', city: 'تهران', sport: 'پدل', level: 'پیشرفته', availability: 'آخر هفته', avatar: '👩🏻' },
  { id: '3', name: 'سامان کریمی', city: 'اصفهان', sport: 'تنیس', level: 'مبتدی', availability: 'صبح‌ها', avatar: '👨🏽' },
];
const money = (value: number) => new Intl.NumberFormat('fa-IR').format(value);

export default function Home() {
  const [courts, setCourts] = useState(fallbackCourts);
  const [city, setCity] = useState('همه شهرها');
  const [sport, setSport] = useState('همه رشته‌ها');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return;
    fetch(`${base}/courts`).then((response) => response.ok ? response.json() : null)
      .then((data: Court[] | null) => { if (data?.length) setCourts(data); }).catch(() => undefined);
  }, []);

  const shownCourts = courts.filter((court) => (city === 'همه شهرها' || court.city === city) && (sport === 'همه رشته‌ها' || court.sport === (sport === 'تنیس' ? 'TENNIS' : 'PADEL')));
  function inform(message: string) { setNotice(message); window.setTimeout(() => setNotice(''), 2700); }

  return <>
    <header className="wrap topbar"><a className="brand" href="#top"><span className="brand-mark">و</span> ورزشا</a><nav className="nav"><a href="#courts">رزرو زمین</a><a href="#players">همبازی</a><a href="#services">مربی‌ها</a><a href="#clubs">برای باشگاه‌ها</a></nav><div className="top-actions"><button className="login" onClick={() => inform('ورود کاربران به‌زودی فعال می‌شود')}>ورود</button><button className="join" onClick={() => inform('ثبت‌نام به‌زودی فعال می‌شود')}>عضویت رایگان</button></div></header>
    <main className="wrap" id="top"><section className="hero"><div><span className="eyebrow"><i className="dot"/> زمین بازی بعدی‌ات نزدیکه</span><h1>زمینت رو پیدا کن،<br/><em>بازی رو شروع کن.</em></h1><p className="intro">همبازی هم‌سطحت رو پیدا کن، زمین رزرو کن و با بهترین مربی‌ها تمرین کن. همه‌چیز برای بازی بهتر، یک‌جا جمع شده.</p><div className="hero-buttons"><a className="primary" href="#courts">پیدا کردن زمین ←</a><a className="secondary" href="#players">پیدا کردن همبازی</a></div><div className="trust"><div className="faces"><i className="face">👨🏻</i><i className="face">👩🏻</i><i className="face">👨🏽</i></div><span>همراه بازیکنان تنیس و پدل در سراسر ایران</span></div></div><div className="hero-visual"><div className="court-lines"/><div className="hero-ball">🎾</div><div className="float-card float-one"><b>وقت بازیه!</b><span>یک زمین نزدیکت پیدا کردیم</span></div><div className="float-card float-two"><b className="stars">★★★★★ <span>۴.۹</span></b><span>باشگاه‌های منتخب بازیکنان</span></div></div></section>
      <section className="search" aria-label="جستجوی زمین"><div className="field"><label htmlFor="sport">رشته ورزشی</label><select id="sport" value={sport} onChange={(e) => setSport(e.target.value)}><option>همه رشته‌ها</option><option>تنیس</option><option>پدل</option></select></div><div className="field"><label htmlFor="city">شهر</label><select id="city" value={city} onChange={(e) => setCity(e.target.value)}><option>همه شهرها</option><option>تهران</option><option>اصفهان</option><option>بابل</option><option>لنگرود</option></select></div><div className="field"><label htmlFor="time">زمان بازی</label><select id="time"><option>امروز</option><option>فردا</option><option>این هفته</option></select></div><button className="search-btn" onClick={() => document.getElementById('courts')?.scrollIntoView({ behavior: 'smooth' })}>جستجوی زمین</button></section>
      <section className="section"><div className="section-head"><div><h2>رشته‌ات رو انتخاب کن</h2><p>از زمین تا همبازی، مسیر مخصوص خودت رو بساز</p></div></div><div className="sports"><article className="sport"><div><h3>تنیس</h3><p>زمین، مربی و همبازی تنیس رو پیدا کن</p></div><div className="sport-icon">🎾</div></article><article className="sport padel"><div><h3>پدل <span className="badge">در حال رشد</span></h3><p>دنیای پرهیجان پدل منتظرته</p></div><div className="sport-icon">🏸</div></article></div></section>
      <section className="section" id="courts"><div className="section-head"><div><h2>زمین‌های پیشنهادی</h2><p>باشگاه‌های محبوب بازیکنان نزدیک شما</p></div><span className="all">{shownCourts.length} زمین</span></div><div className="cards">{shownCourts.length ? shownCourts.map((court) => <article className="club" key={court.id}><div className="club-img"><span>{court.sport === 'PADEL' ? '🏸' : '🎾'}</span><i className="available">● سانس آزاد</i></div><div className="club-info"><div className="club-meta"><span>📍 {court.city}، {court.district}</span><span>⭐ {court.rating}</span></div><h3>{court.name}</h3><div className="club-meta"><span>{court.surface} · {court.sport === 'PADEL' ? 'پدل' : 'تنیس'}</span><span>{court.nextSlot}</span></div><div className="price"><span>شروع از <b>{money(court.price)} تومان</b></span><a className="book" href={`/court/reserve/${court.slug}`}>رزرو زمین</a></div></div></article>) : <p className="empty">در این فیلتر زمینی پیدا نشد.</p>}</div></section>
      <section className="section" id="players"><div className="section-head"><div><h2>همبازی‌های آماده‌ی بازی</h2><p>بازیکن‌هایی با سطح و زمان آزاد نزدیک به شما</p></div></div><div className="people">{players.map((player) => <article className="person" key={player.id}><div className="avatar">{player.avatar}</div><div><h3>{player.name}</h3><p>{player.city} · {player.sport} · {player.availability}</p></div><span className="level">{player.level}</span></article>)}</div></section>
      <section className="section" id="services"><div className="section-head"><div><h2>بیشتر از یک زمین بازی</h2><p>همه‌ی ابزارهای پیشرفت و رقابت در دسترس توست</p></div></div><div className="services"><article className="service"><span>🏆</span><h3>لیگ و مسابقات</h3><p>در لیگ‌های شهری شرکت کن و جایگاهت رو بالا ببر.</p></article><article className="service"><span>📈</span><h3>رنکینگ بازیکنان</h3><p>پیشرفتت رو ببین و با بازیکنان شهر رقابت کن.</p></article><article className="service"><span>🎓</span><h3>مربی‌های حرفه‌ای</h3><p>مربی مناسب سطح و هدفت رو پیدا کن.</p></article><article className="service"><span>📖</span><h3>مجله ورزشا</h3><p>راهنمای بازی، تمرین، قوانین و تجهیزات.</p></article></div></section>
      <section className="banner" id="clubs"><div><h2>باشگاهت رو به بازیکنان بیشتری معرفی کن</h2><p>مدیریت رزروها، سانس‌ها و مشتری‌ها در یک پنل ساده.</p></div><button onClick={() => inform('درخواست همکاری باشگاه‌ها به‌زودی فعال می‌شود')}>همکاری با ورزشا ←</button></section>
    </main><footer className="wrap footer"><div>© ورزشا — برای عشق به بازی ساخته شده 💚</div><div className="footer-links"><a href="#services">راهنما و سوالات متداول</a><a href="#clubs">همکاری با ما</a><a href="#top">اینستاگرام</a></div></footer>{notice && <div className="toast" role="status">{notice}</div>}
  </>;
}
