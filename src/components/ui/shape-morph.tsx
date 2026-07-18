'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './shape-morph.css';

const BASE = 'https://raw.githubusercontent.com/codrops/OnScrollShapeMorph/main/img';
const IMGS = {
  i1:  `${BASE}/1.jpg`,  i3:  `${BASE}/3.jpg`,  i4:  `${BASE}/4.jpg`,
  i5:  `${BASE}/5.jpg`,  i6:  `${BASE}/6.jpg`,  i7:  `${BASE}/7.jpg`,
  i8:  `${BASE}/8.jpg`,  i9:  `${BASE}/9.jpg`,  i10: `${BASE}/10.jpg`,
  i15: `${BASE}/15.jpg`, i16: `${BASE}/16.jpg`, i17: `${BASE}/17.jpg`,
};

const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;
const map  = (x: number, a: number, b: number, c: number, d: number) =>
  (x - a) * (d - c) / (b - a) + c;

// InteractiveTilt receives a shared mutable `state` object so it always reads
// the latest cursor/winsize values — no stale-closure bugs.
type State = { winsize: { width: number; height: number }; cursor: { x: number; y: number } };

class InteractiveTilt {
  wrapEl: Element | null;
  options: any;
  t = { x: 0, y: 0, rx: 0, ry: 0, rz: 0 };
  rafId = 0;

  constructor(el: Element, state: State, options?: any) {
    this.wrapEl = el.querySelector('.sm-content__img-wrap');
    this.options = Object.assign({
      perspective: 800,
      vft: { x: [-35,35], y: [-35,35], rx: [-18,18], ry: [-10,10], rz: [-4,4] },
      amt: 0.1,
    }, options);

    if (this.options.perspective)
      (el as HTMLElement).style.perspective = `${this.options.perspective}px`;

    const render = () => {
      const { winsize, cursor } = state;          // always reads the latest values
      const { vft, amt } = this.options;
      this.t.x  = lerp(this.t.x,  map(cursor.x, 0, winsize.width,  vft.x[0],  vft.x[1]),  amt);
      this.t.y  = lerp(this.t.y,  map(cursor.y, 0, winsize.height, vft.y[0],  vft.y[1]),  amt);
      this.t.rz = lerp(this.t.rz, map(cursor.x, 0, winsize.width,  vft.rz[0], vft.rz[1]), amt);
      this.t.rx = this.options.perspective
        ? lerp(this.t.rx, map(cursor.y, 0, winsize.height, vft.rx[0], vft.rx[1]), amt) : 0;
      this.t.ry = this.options.perspective
        ? lerp(this.t.ry, map(cursor.x, 0, winsize.width,  vft.ry[0], vft.ry[1]), amt) : 0;
      if (this.wrapEl)
        (this.wrapEl as HTMLElement).style.transform =
          `translateX(${this.t.x}px) translateY(${this.t.y}px) ` +
          `rotateX(${this.t.rx}deg) rotateY(${this.t.ry}deg) rotateZ(${this.t.rz}deg)`;
      this.rafId = requestAnimationFrame(render);
    };
    this.rafId = requestAnimationFrame(render);
  }
  destroy() { cancelAnimationFrame(this.rafId); }
}

export function ShapeMorph() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let aborted = false;

    gsap.registerPlugin(ScrollTrigger);

    // shared mutable state — one object, properties mutate in place
    const state: State = {
      winsize: { width: window.innerWidth, height: window.innerHeight },
      cursor:  { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    };
    const onResize    = () => { state.winsize = { width: window.innerWidth, height: window.innerHeight }; };
    const onMouseMove = (ev: MouseEvent) => { state.cursor = { x: ev.clientX, y: ev.clientY }; };
    window.addEventListener('resize',    onResize);
    window.addEventListener('mousemove', onMouseMove);

    // gsap.context scoped to root — revert() only kills what was created here
    const ctx = gsap.context(root);

    // ── text splitting (all spans, not just [data-splitting]) ──
    const prepareText = (itemEl: Element) => {
      const spans = itemEl.querySelectorAll('.sm-content__text > span');
      spans.forEach(span => {
        if (span.querySelector('.char')) return; // already split
        const raw = span.textContent ?? '';
        span.innerHTML = raw.split('').map(ch =>
          ch === ' ' ? '<span class="whitespace"> </span>' : `<span class="char">${ch}</span>`
        ).join('');
      });
      const chars = Array.from(spans).map(s => Array.from(s.querySelectorAll('.char')));
      chars.forEach(arr => gsap.set(arr, { opacity: 0 }));
      return chars;
    };

    const defaults = (el: Element, opts?: any) => {
      const d: any = {
        clipPaths: {
          step1: { initial: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', final: 'polygon(50% 0%, 50% 50%, 50% 50%, 50% 100%)' },
          step2: { initial: 'polygon(50% 50%, 50% 0%, 50% 100%, 50% 50%)', final: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' },
        },
        scrollTrigger: { trigger: el, start: 'top 50%', end: '+=50%', scrub: true },
        perspective: false,
      };
      if (opts?.scrollTrigger) d.scrollTrigger = { ...d.scrollTrigger, ...opts.scrollTrigger };
      return { ...d, ...opts, scrollTrigger: d.scrollTrigger };
    };

    // ─── fx functions (identical logic to original) ───────────────────────────

    const fx1 = (el: Element, opts?: any) => {
      const s = defaults(el, opts);
      const img = el.querySelector('.sm-content__img')!;
      const inn = img.querySelectorAll('.sm-content__img-inner');
      const chars = prepareText(el);
      const tl = gsap.timeline({ defaults: { ease: 'none' },
        onStart: () => { if (s.perspective) gsap.set(img, { perspective: s.perspective }); },
        scrollTrigger: s.scrollTrigger })
        .fromTo(img, { filter: 'brightness(100%)', 'clip-path': s.clipPaths.step1.initial },
                     { ease: 'sine.in', filter: 'brightness(800%)', 'clip-path': s.clipPaths.step1.final }, 0)
        .to(inn[0], { ease: 'sine.in', rotationY: -40, scale: 1.4 }, 0)
        .add(() => { inn[0].classList.toggle('sm-content__img-inner--hidden'); inn[1].classList.toggle('sm-content__img-inner--hidden'); })
        .to(img, { startAt: { 'clip-path': s.clipPaths.step2.initial }, 'clip-path': s.clipPaths.step2.final, filter: 'brightness(100%)' })
        .to(inn[1], { startAt: { rotationY: 40, scale: 1.4 }, rotationY: 0, scale: 1 }, '<')
        .addLabel('texts', '<-=0.3');
      chars.forEach((arr, i) => { const d = i%2===0?1:-1; tl.to(arr, { startAt:{opacity:1,scale:.2}, opacity:1, scale:1, yPercent:-d*40, stagger:d*0.04 }, 'texts'); });
      return tl;
    };

    const fx2 = (el: Element, opts?: any) => {
      const s = defaults(el, opts);
      const img = el.querySelector('.sm-content__img')!;
      const inn = img.querySelectorAll('.sm-content__img-inner');
      const chars = prepareText(el);
      const tl = gsap.timeline({ defaults: { ease: 'none' },
        onStart: () => { if (s.perspective) gsap.set([img, el], { perspective: s.perspective }); },
        scrollTrigger: s.scrollTrigger })
        .fromTo(img, { filter: 'brightness(100%) hue-rotate(0deg)', 'clip-path': s.clipPaths.step1.initial },
                     { filter: 'brightness(800%) hue-rotate(90deg)', 'clip-path': s.clipPaths.step1.final }, 0)
        .to(inn[0], { rotationZ: -5, scaleX: 1.8 }, 0)
        .add(() => { inn[0].classList.toggle('sm-content__img-inner--hidden'); inn[1].classList.toggle('sm-content__img-inner--hidden'); })
        .to(img, { startAt: { 'clip-path': s.clipPaths.step2.initial }, 'clip-path': s.clipPaths.step2.final, filter: 'brightness(100%) hue-rotate(0deg)' })
        .to(inn[1], { startAt: { rotationZ: 5, scaleX: 1.8 }, rotationZ: 0, scaleX: 1 }, '<')
        .addLabel('texts', '<-=0.3');
      chars.forEach((arr, i) => { const sorted=[...arr].sort(()=>Math.random()-.5); const d=i%2===0?1:-1; tl.to(sorted,{duration:.1,opacity:1,stagger:d*.04},'texts'); });
      return tl;
    };

    const fx3 = (el: Element, opts?: any) => {
      const s = defaults(el, opts);
      const img = el.querySelector('.sm-content__img')!;
      const inn = img.querySelectorAll('.sm-content__img-inner');
      const text = el.querySelector('.sm-content__text');
      return gsap.timeline({ defaults: { ease: 'none' },
        onStart: () => { if (s.perspective) gsap.set([img, el], { perspective: s.perspective }); },
        scrollTrigger: s.scrollTrigger })
        .fromTo(img, { scale:.3, filter:'brightness(100%) contrast(100%)', 'clip-path':s.clipPaths.step1.initial },
                     { ease:'sine', rotationX:-35, rotationY:35, filter:'brightness(60%) contrast(400%)', scale:.7, 'clip-path':s.clipPaths.step1.final }, 0)
        .to(inn[0], { ease:'sine', skewY:10, scaleY:1.2 }, 0)
        .add(() => { inn[0].classList.toggle('sm-content__img-inner--hidden'); inn[1].classList.toggle('sm-content__img-inner--hidden'); }, '>')
        .to(img, { ease:'sine.in', startAt:{'clip-path':s.clipPaths.step2.initial}, 'clip-path':s.clipPaths.step2.final, filter:'brightness(100%) contrast(100%)', scale:1, rotationX:0, rotationY:0 }, '<')
        .to(inn[1], { ease:'sine.in', startAt:{skewY:10,scaleY:2}, skewY:0, scaleY:1 }, '<')
        .fromTo(text, { opacity:0, yPercent:40 }, { opacity:1, yPercent:0 }, '>')
        .to(img, { ease:'sine', startAt:{filter:'brightness(100%) contrast(100%) opacity(100%)'}, filter:'brightness(60%) contrast(400%) opacity(0%)', rotationX:25, rotationY:2, scale:1.2 }, '<');
    };

    const fx4 = (el: Element, opts?: any) => {
      const s = defaults(el, opts);
      const img = el.querySelector('.sm-content__img')!;
      const inn = img.querySelectorAll('.sm-content__img-inner');
      const chars = prepareText(el);
      const tl = gsap.timeline({ defaults: { ease: 'power1.inOut' },
        onStart: () => { if (s.perspective) gsap.set([img, el], { perspective: s.perspective }); },
        scrollTrigger: s.scrollTrigger })
        .fromTo(img, { filter:'brightness(100%) grayscale(0%)', 'clip-path':s.clipPaths.step1.initial },
                     { rotationZ:90, scale:.6, filter:'brightness(800%) grayscale(100%)', 'clip-path':s.clipPaths.step1.final }, 0)
        .to(inn[0], { rotationZ:-5, scaleX:1.4 }, 0)
        .add(() => { inn[0].classList.toggle('sm-content__img-inner--hidden'); inn[1].classList.toggle('sm-content__img-inner--hidden'); })
        .to(img, { startAt:{'clip-path':s.clipPaths.step1.final,rotationZ:-90}, 'clip-path':s.clipPaths.step2.final, filter:'brightness(100%) grayscale(0%)', rotationZ:0, scale:1 })
        .to(inn[1], { startAt:{rotationZ:-350,scaleX:1.4}, rotationZ:-360, scaleX:1 }, '<')
        .addLabel('texts', '<-=0.3');
      chars.forEach((arr, i) => { const d=i%2===0?1:-1; tl.to(arr,{startAt:{opacity:1,scale:.2},opacity:1,scale:1,yPercent:d*400,stagger:d*.02},'texts'); });
      return tl;
    };

    const fx5 = (el: Element, opts?: any) => {
      const s = defaults(el, opts);
      const img = el.querySelector('.sm-content__img')!;
      const inn = img.querySelectorAll('.sm-content__img-inner');
      const chars = prepareText(el);
      const tl = gsap.timeline({ defaults: { ease: 'back.out(1.5)' },
        onStart: () => { if (s.perspective) gsap.set([img, el], { perspective: s.perspective }); },
        scrollTrigger: s.scrollTrigger })
        .fromTo(img, { filter:'brightness(100%) saturate(100%)', 'clip-path':s.clipPaths.step1.initial },
                     { ease:'back.in(1.5)', rotationZ:90, scale:.6, filter:'brightness(300%) saturate(200%)', 'clip-path':s.clipPaths.step1.final }, 0)
        .to(inn[0], { ease:'back.in(1.5)', scaleX:1.4 }, 0)
        .add(() => { inn[0].classList.toggle('sm-content__img-inner--hidden'); inn[1].classList.toggle('sm-content__img-inner--hidden'); })
        .to(img, { startAt:{'clip-path':s.clipPaths.step1.final,rotationZ:-90}, 'clip-path':s.clipPaths.step2.final, filter:'brightness(100%) saturate(100%)', rotationZ:0, scale:1 })
        .to(inn[1], { startAt:{scaleX:1.4}, scaleX:1 }, '<')
        .addLabel('texts', '<-=0.3');
      chars.forEach((arr, i) => { const sorted=[...arr].sort(()=>Math.random()-.5); const d=i%2===0?1:-1; tl.fromTo(sorted,{opacity:1,transformOrigin:`50% ${d<0?100:0}%`,scaleY:0},{duration:.1,ease:'none',scaleY:1,stagger:d*.02},'texts'); });
      return tl;
    };

    const fx6 = (el: Element, opts?: any) => {
      const s = defaults(el, opts);
      const img = el.querySelector('.sm-content__img')!;
      const inn = img.querySelector('.sm-content__img-inner')!;
      const chars = prepareText(el);
      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' },
        onStart: () => { if (s.perspective) gsap.set(img, { perspective: s.perspective }); },
        scrollTrigger: s.scrollTrigger })
        .fromTo(img, { scale:.2, filter:'brightness(50%)', 'clip-path':s.clipPaths.step1.initial, transformOrigin:'75% 50%' },
                     { scale:1, filter:'brightness(100%)', 'clip-path':s.clipPaths.step1.final }, 0)
        .fromTo(inn, { rotationY:40, scale:2 }, { rotationY:0, scale:1 }, 0);
      chars.forEach((arr, i) => { const d=i%2===0?1:-1; tl.fromTo(arr,{opacity:0,scale:1.2},{opacity:1,scale:1,yPercent:d*100,stagger:d*-.02},0); });
      return tl;
    };

    const fxIntro = (el: Element, opts?: any) => {
      const s = defaults(el, opts);
      const img = el.querySelector('.sm-content__img')!;
      const inn = img.querySelector('.sm-content__img-inner')!;
      return gsap.timeline({ defaults: { ease: 'none' },
        onStart: () => { if (s.perspective) gsap.set(img, { perspective: s.perspective }); },
        scrollTrigger: s.scrollTrigger })
        .fromTo(img, { scale:1, xPercent:0, filter:'brightness(100%)', 'clip-path':s.clipPaths.step1.initial },
                     { scale:.5, xPercent:-50, 'clip-path':s.clipPaths.step1.final, filter:'brightness(500%)' }, 0)
        .to(inn, { rotationY:-40, scale:1.4 }, 0)
        .to(img, { startAt:{'clip-path':s.clipPaths.step2.initial}, scale:0, xPercent:-100, 'clip-path':s.clipPaths.step2.final, filter:'brightness(100%)' })
        .to(inn, { startAt:{rotationY:40}, rotationY:0, scale:1 }, '<');
    };

    // ── item configs ──────────────────────────────────────────────────────────
    const items = [
      // start:'top top' = intro fully in view before animation begins; end:'bottom top' = image gone as intro scrolls out
      { id:'sm-item-intro', fx:fxIntro, tilt:true,  options:{ scrollTrigger:{start:'top top',end:'bottom top'}, perspective:1000 } },
      { id:'sm-item-1',     fx:fx1,     tilt:true,  options:{ perspective:1000 } },
      { id:'sm-item-2',     fx:fx2,     tilt:true,  options:{ clipPaths:{ step1:{initial:'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',final:'polygon(40% 50%, 60% 50%, 80% 50%, 20% 50%)'}, step2:{initial:'polygon(20% 50%, 80% 50%, 60% 50%, 40% 50%)',final:'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'} }, scrollTrigger:{start:'center bottom',end:'top top'}, perspective:500 } },
      { id:'sm-item-3',     fx:fx3,     tilt:false, options:{ clipPaths:{ step1:{initial:'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',final:'polygon(50% 0%, 50% 50%, 50% 50%, 50% 100%)'}, step2:{initial:'polygon(50% 50%, 50% 0%, 50% 100%, 50% 50%)',final:'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'} }, scrollTrigger:{start:'center center',end:'+=150%',pin:true}, perspective:400 } },
      { id:'sm-item-4',     fx:fx4,     tilt:true,  options:{ clipPaths:{ step1:{initial:'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',final:'polygon(40% 50%, 60% 50%, 80% 50%, 20% 50%)'}, step2:{initial:'polygon(20% 50%, 80% 50%, 60% 50%, 40% 50%)',final:'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'} }, scrollTrigger:{start:'center bottom',end:'top top-=10%'}, perspective:500 } },
      { id:'sm-item-5',     fx:fx5,     tilt:true,  options:{ clipPaths:{ step1:{initial:'polygon(50% 0%, 80% 10%, 100% 35%, 100% 70%, 80% 90%, 50% 100%, 20% 90%, 0% 70%, 0% 35%, 20% 10%)',final:'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)'}, step2:{initial:'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)',final:'polygon(50% 0%, 80% 10%, 100% 35%, 100% 70%, 80% 90%, 50% 100%, 20% 90%, 0% 70%, 0% 35%, 20% 10%)'} }, scrollTrigger:{start:'top bottom+=20%',end:'bottom top'}, perspective:500 } },
      { id:'sm-item-6',     fx:fx6,     tilt:true,  options:{ clipPaths:{ step1:{initial:'polygon(50% 0%, 50% 50%, 50% 50%, 50% 100%)',final:'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'} }, scrollTrigger:{start:'center bottom',end:'+=80%'}, perspective:1000 } },
    ];

    const tilts: InteractiveTilt[] = [];

    // wait for all background images then start
    const allInners = root.querySelectorAll('.sm-content__img-inner');
    Promise.all(Array.from(allInners).map(el => {
      const url = (el as HTMLElement).style.backgroundImage.replace(/url\(["']?|["']?\)/g,'');
      if (!url) return Promise.resolve();
      return new Promise<void>(res => { const i=new Image(); i.onload=i.onerror=()=>res(); i.src=url; });
    })).then(() => {
      if (aborted) return;
      root.classList.remove('loading');
      ctx.add(() => {
        items.forEach(({ id, fx, tilt, options }) => {
          const el = root.querySelector(`#${id}`);
          if (!el) return;
          fx(el, options);
          if (tilt) tilts.push(new InteractiveTilt(el, state));
        });
      });
    });

    return () => {
      aborted = true;
      ctx.revert();
      tilts.forEach(t => t.destroy());
      window.removeEventListener('resize',    onResize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div ref={rootRef} className="sm-section loading">
      <div className="sm-intro">
        <div id="sm-item-intro" className="sm-content sm-content--intro">
          <div className="sm-content__img-wrap">
            <div className="sm-content__img sm-content__img--1">
              <div className="sm-content__img-inner" style={{ backgroundImage:`url(${IMGS.i1})` }} />
            </div>
          </div>
        </div>
        <h1 className="sm-intro__title"><span className="sm-intro__title-pre">Xtynct</span></h1>
        <span className="sm-intro__info">Scroll moderately for a better animation experience.</span>
      </div>

      <div className="sm-content-wrap">
        <div id="sm-item-1" className="sm-content">
          <div className="sm-content__img-wrap">
            <div className="sm-content__img sm-content__img--1">
              <div className="sm-content__img-inner" style={{ backgroundImage:`url(${IMGS.i4})` }} />
              <div className="sm-content__img-inner sm-content__img-inner--hidden" style={{ backgroundImage:`url(${IMGS.i3})` }} />
            </div>
          </div>
          <p className="sm-content__text sm-content__text--center sm-content__text--large">
            <span data-splitting>Obey the silence</span><span data-splitting>Rebel in shadows</span>
          </p>
        </div>

        <div id="sm-item-2" className="sm-content">
          <div className="sm-content__img-wrap">
            <div className="sm-content__img sm-content__img--1">
              <div className="sm-content__img-inner" style={{ backgroundImage:`url(${IMGS.i5})` }} />
              <div className="sm-content__img-inner sm-content__img-inner--hidden" style={{ backgroundImage:`url(${IMGS.i6})` }} />
            </div>
          </div>
          <p className="sm-content__text sm-content__text--left">
            <span>From Thrones to Chains</span><span>Surrender of Sovereignty</span>
          </p>
        </div>

        <div id="sm-item-3" className="sm-content">
          <div className="sm-content__img-wrap">
            <div className="sm-content__img sm-content__img--2">
              <div className="sm-content__img-inner" style={{ backgroundImage:`url(${IMGS.i7})` }} />
              <div className="sm-content__img-inner sm-content__img-inner--hidden" style={{ backgroundImage:`url(${IMGS.i8})` }} />
            </div>
          </div>
          <p className="sm-content__text sm-content__text--left">
            <span>You make me dream </span><span>Your dreams</span>
            <span className="sm-content__text-tiny">Do you ever dream of a dream so real it makes you question reality? What is reality? Do you question it? Turn off the light switch. Does it turn off? Question right now: is it a dream? You always wake up once you realize it's a dream. So, don't wake up. Realize it's a dream. That's how you enter the real world.</span>
          </p>
        </div>

        <div id="sm-item-4" className="sm-content">
          <div className="sm-content__img-wrap">
            <div className="sm-content__img sm-content__img--4">
              <div className="sm-content__img-inner" style={{ backgroundImage:`url(${IMGS.i9})` }} />
              <div className="sm-content__img-inner sm-content__img-inner--hidden" style={{ backgroundImage:`url(${IMGS.i10})` }} />
            </div>
          </div>
          <p className="sm-content__text sm-content__text--center">
            <span>Your Willingness is</span><span>Collective Triumph</span>
          </p>
        </div>

        <div id="sm-item-5" className="sm-content">
          <div className="sm-content__img-wrap">
            <div className="sm-content__img sm-content__img--5">
              <div className="sm-content__img-inner" style={{ backgroundImage:`url(${IMGS.i16})` }} />
              <div className="sm-content__img-inner sm-content__img-inner--hidden" style={{ backgroundImage:`url(${IMGS.i15})` }} />
            </div>
          </div>
          <p className="sm-content__text sm-content__text--left">
            <span>Controlling my feelings</span><span>for too long</span>
          </p>
        </div>

        <div id="sm-item-6" className="sm-content">
          <div className="sm-content__img-wrap">
            <div className="sm-content__img sm-content__img--6">
              <div className="sm-content__img-inner" style={{ backgroundImage:`url(${IMGS.i17})` }} />
            </div>
          </div>
          <p className="sm-content__text sm-content__text--center">
            <span>You were never truly loved</span><span>You have only been betrayed</span>
          </p>
        </div>
      </div>

      <p className="sm-credits">Made by <a href="https://twitter.com/codrops" target="_blank" rel="noreferrer">@codrops</a></p>
    </div>
  );
}
