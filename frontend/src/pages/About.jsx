import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ShieldCheck, Zap } from 'lucide-react';
import { BASE_URL } from '../services/api';

const About = () => {
  const navigate = useNavigate();
  const [aboutContent, setAboutContent] = React.useState({
    excellence: { title: 'Excellence', description: 'We settle for nothing less than the best in every product we offer.' },
    integrity: { title: 'Integrity', description: 'Transparency and trust are the foundations of our relationship with you.' },
    innovation: { title: 'Innovation', description: 'Constantly seeking new ways to enhance your shopping experience.' }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Fetch about content from backend
    fetch(`${BASE_URL}/about`)
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setAboutContent(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error("Failed to fetch about content:", err));
  }, []);

  return (
    <div className="about-page">
      <section className="brioni-hero">
        <img src="/hero-about.png" alt="About Aurumvice" className="brioni-hero-bg" style={{ filter: 'brightness(0.7)' }} />
        <div className="brioni-hero-overlay" style={{ justifyContent: 'center', padding: 0 }}>
          <div className="hero-tagline" style={{ color: 'white', letterSpacing: '0.4rem', marginBottom: '1rem', fontSize: '0.8rem' }}>OUR HERITAGE</div>
          <h1 className="brioni-hero-title" style={{ fontSize: '3rem', letterSpacing: '1rem' }}>BEYOND ORDINARY</h1>
        </div>
      </section>

      <div className="about-content" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        <div className="about-manifesto">
          <p className="quote">
            "AURUMVICE was born from a simple vision: to curate a collection of products that don't just fill a space, but elevate an experience."
          </p>
          <div style={{ width: '40px', height: '1px', background: '#000', margin: '3rem auto' }}></div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: '2' }}>
            From hand-picked tailoring to artisanal goods, every item in our catalog undergoes a rigorous selection process. We don't just sell products; we offer a gateway to a more refined way of living.
          </p>
        </div>

        <div className="about-craft-grid">
          <img src="/about-female.png" alt="Our Craft 1" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
          <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200" alt="Our Craft 2" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', marginTop: '4rem' }} />
        </div>

        <section style={{ marginBottom: '8rem' }}>
          <h2 style={{ fontFamily: 'var(--body-font)', fontSize: '1.2rem', letterSpacing: '0.4rem', textAlign: 'center', marginBottom: '4rem', textTransform: 'uppercase' }}>Our Foundation</h2>
          <div className="foundation-grid">
            <div>
              <Award size={24} color="#000" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '0.9rem', letterSpacing: '0.1rem', textTransform: 'uppercase', marginBottom: '1rem' }}>{aboutContent.excellence.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>{aboutContent.excellence.description}</p>
            </div>
            <div>
              <ShieldCheck size={24} color="#000" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '0.9rem', letterSpacing: '0.1rem', textTransform: 'uppercase', marginBottom: '1rem' }}>{aboutContent.integrity.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>{aboutContent.integrity.description}</p>
            </div>
            <div>
              <Zap size={24} color="#000" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '0.9rem', letterSpacing: '0.1rem', textTransform: 'uppercase', marginBottom: '1rem' }}>{aboutContent.innovation.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>{aboutContent.innovation.description}</p>
            </div>
          </div>
        </section>

        <section style={{ padding: '6rem 0', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontFamily: 'var(--header-font)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>Experience Aurumvice</h2>
          <p style={{ maxWidth: '500px', margin: '0 auto 1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            We are more than just a store; we are a lifestyle movement. Step into the world of uncompromising quality.
          </p>
          <div style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.1rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.3rem' }}>Email Inquiries</p>
              <a href="mailto:imamalirabbani@gmail.com" style={{ color: '#000', fontSize: '1.1rem', textDecoration: 'none', borderBottom: '1px solid #000', paddingBottom: '2px' }}>imamalirabbani@gmail.com</a>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.1rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.3rem' }}>Direct Contact</p>
              <a href="tel:+6285182235662" style={{ color: '#000', fontSize: '1.1rem', textDecoration: 'none', borderBottom: '1px solid #000', paddingBottom: '2px' }}>+62 851-8223-5662</a>
            </div>
          </div>
          <button className="btn btn-primary" style={{ padding: '15px 40px' }} onClick={() => navigate('/')}>EXPLORE COLLECTION</button>
        </section>
      </div>
    </div>
  );
};

export default About;
