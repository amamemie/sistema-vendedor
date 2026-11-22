import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../ui/Icon';
import { imgUrl } from './Store';
import { formatMoney } from '../../i18n/format';

/** Escena CSS 3D: tarjetas de productos reales a distintas profundidades + caja giratoria. */
function Scene({ products }) {
  const stage = useRef(null);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;
    let raf = 0;
    const onMove = (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--sx', `${-8 + y * -10}deg`);
        el.style.setProperty('--sy', `${-18 + x * 22}deg`);
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const cards = products.slice(0, 4);

  return (
    <div className="hero3d-stage" aria-hidden="true">
      <div className="hero3d-scene" ref={stage}>
        <div className="hero3d-floor" />
        {cards.map((p, i) => (
          <div key={p.id_producto} className={`hero3d-card hero3d-card--${i}`}>
            <div className="hero3d-card-inner">
              <img src={imgUrl(p.imagen_principal)} alt="" />
              <div className="hero3d-card-info">
                <span>{p.nombre}</span>
                <strong>{formatMoney(p.precio_unitario)}</strong>
              </div>
            </div>
          </div>
        ))}
        <div className="hero3d-cube">
          {['front', 'back', 'right', 'left', 'top', 'bottom'].map((f) => (
            <span key={f} className={`hero3d-face hero3d-face--${f}`}>
              {f === 'front' || f === 'right' ? 'M' : ''}
            </span>
          ))}
        </div>
        <div className="hero3d-ring" />
      </div>
    </div>
  );
}

export default function Hero3D({ products, storeCount, onPrimary, onSecondary }) {
  const { t } = useTranslation();
  const withImages = products.filter((p) => p.imagen_principal);

  return (
    <section className="hero3d">
      <div className="hero3d-copy">
        <span className="hero3d-eyebrow">
          <span className="dot" /> {t('hero.eyebrow', { count: storeCount })}
        </span>
        <h1>{t('hero.title')}</h1>
        <p>{t('hero.lead', { count: products.length })}</p>
        <div className="hero3d-cta">
          <button type="button" className="btn btn-ink btn-lg" onClick={onPrimary}>
            {t('hero.primary')} <Icon name="arrowRight" size={17} />
          </button>
          <button type="button" className="btn btn-outline btn-lg" onClick={onSecondary}>
            {t('hero.secondary')}
          </button>
        </div>
        <ul className="hero3d-facts">
          <li><Icon name="shield" size={16} /> {t('hero.fact1')}</li>
          <li><Icon name="truck" size={16} /> {t('hero.fact2')}</li>
          <li><Icon name="chat" size={16} /> {t('hero.fact3')}</li>
        </ul>
      </div>
      {withImages.length > 0 && <Scene products={withImages} />}
    </section>
  );
}
