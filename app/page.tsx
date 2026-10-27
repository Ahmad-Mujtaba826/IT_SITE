"use client";
import { useEffect, useRef, useState } from "react";

const SERVICES = [
  ["🌐","Web development","Fast, secure web apps and portals tailored to your business needs."],
  ["📱","Mobile apps","iOS and Android apps that feel native, from a single codebase."],
  ["🤖","AI solutions","Chatbots, retrieval systems and automations trained on your own data."],
  ["☁️","Cloud and DevOps","AWS architecture, serverless backends and pipelines that deploy daily."],
  ["🎨","UI and UX design","Research led interfaces your customers understand on the first try."],
  ["📊","Data and analytics","Dashboards and pipelines that turn raw numbers into decisions."],
];

const TECHS = ["Angular","React","Node.js","AWS","Python","Kubernetes","Flutter","PostgreSQL","TypeScript","Docker","Terraform","LLMs"];

export default function Home() {
  const glRef = useRef<HTMLCanvasElement>(null);
  const [chatLog, setChatLog] = useState([{ role: "ai", text: "Hi, I'm Axiora's assistant. Tell me what you want to build and I'll suggest where to start." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: "success"|"error"; msg: string }|null>(null);
  const [formSending, setFormSending] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [chatLog]);

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".svc");
    cards.forEach(c => c.addEventListener("pointermove", (e: Event) => {
      const pe = e as PointerEvent;
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (pe.clientX - r.left) + "px");
      c.style.setProperty("--my", (pe.clientY - r.top) + "px");
    }));

    const stage = document.querySelector<HTMLElement>(".stage2");
    if (stage) {
      const arc = stage.querySelector<HTMLElement>(".arc");
      stage.addEventListener("pointermove", (e: Event) => {
        const pe = e as PointerEvent;
        const r = stage.getBoundingClientRect();
        const x = pe.clientX - r.left;
        const R = (arc?.offsetWidth ?? 0) / 2;
        const dx = x - r.width / 2;
        stage.style.setProperty("--hx", x + "px");
        stage.style.setProperty("--hy", (R - Math.sqrt(Math.max(R * R - dx * dx, 0))) + "px");
      });
    }

    document.querySelectorAll<HTMLElement>(".planet").forEach(st => {
      const arc = st.querySelector<HTMLElement>(".arc");
      st.addEventListener("pointermove", (e: Event) => {
        const pe = e as PointerEvent;
        const r = st.getBoundingClientRect();
        const x = pe.clientX - r.left;
        const R = (arc?.offsetWidth ?? 0) / 2;
        const dx = x - r.width / 2;
        st.style.setProperty("--hx", x + "px");
        st.style.setProperty("--hy", (130 + R - Math.sqrt(Math.max(R * R - dx * dx, 0))) + "px");
      });
    });
  }, []);

  useEffect(() => {
    const cv = glRef.current;
    if (!cv || !(window as any).THREE) return;
    const THREE = (window as any).THREE;
    let r: any;
    try { r = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); } catch { return; }
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, 1, .1, 60);
    cam.position.z = 8.6;
    const vs = `uniform float t;varying vec3 n;varying vec3 v;void main(){vec3 p=position+normal*(.05*sin(position.x*3.+t*1.4)+.04*sin(position.y*4.-t*1.1));n=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(p,1.);v=-mv.xyz;gl_Position=projectionMatrix*mv;}`;
    const fs = `varying vec3 n;varying vec3 v;uniform float t;vec3 ramp(float x){x=fract(x)*4.;vec3 a=vec3(1.,.24,.94),b=vec3(.35,.24,1.),c=vec3(.2,.78,1.),d=vec3(1.,.54,.17);if(x<1.)return mix(a,b,x);if(x<2.)return mix(b,c,x-1.);if(x<3.)return mix(c,d,x-2.);return mix(d,a,x-3.);}void main(){vec3 N=normalize(n),V=normalize(v);if(dot(N,V)<0.)N=-N;float f=pow(1.-max(dot(N,V),0.),2.);vec3 R=reflect(-V,N);float k=dot(R,vec3(.55,.8,.35))*.9+sin(R.x*3.+t*.5)*.18+sin(R.y*4.-t*.4)*.12+t*.04;vec3 col=ramp(k);col*=.25+1.1*smoothstep(-.6,.8,R.y);vec3 L=normalize(vec3(.4,.8,.7));float sp=pow(max(dot(R,L),0.),60.);float dif=max(dot(N,L),0.);col=col*(.6+.5*dif)+sp*vec3(1.)+f*ramp(k+.3)*.8;gl_FragColor=vec4(pow(col,vec3(.92)),1.);}`;
    const mat = new THREE.ShaderMaterial({ uniforms: { t: { value: 0 } }, vertexShader: vs, fragmentShader: fs, side: THREE.DoubleSide });
    const N = 220, M = 56, P: number[] = [], I: number[] = [];
    for (let i = 0; i < N; i++) {
      const u = i / N * 6.2832, tw = 1.5 * u, k = 1 + .3 * Math.sin(2 * u + .6), ca = Math.cos(tw), sa = Math.sin(tw);
      for (let j = 0; j < M; j++) {
        const w = j / M * 6.2832, a = Math.cos(w) * .95 * k, b = Math.sin(w) * .32 * k, x = a * ca - b * sa, y = a * sa + b * ca;
        P.push((1.45 + x) * Math.cos(u), (1.45 + x) * Math.sin(u), y + .28 * Math.sin(2 * u));
      }
    }
    for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
      const i2 = (i + 1) % N, j2 = (j + 1) % M, a = i * M + j, b = i2 * M + j, c = i2 * M + j2, d = i * M + j2;
      I.push(a, b, d, b, c, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    g.setIndex(I); g.computeVertexNormals();
    const grp = new THREE.Group(); grp.add(new THREE.Mesh(g, mat)); sc.add(grp);
    const cnt = 280, pp = new Float32Array(cnt * 3);
    for (let i = 0; i < cnt; i++) {
      const rr = 3 + Math.random() * 1.8, th = Math.random() * 6.2832, ph = Math.acos(2 * Math.random() - 1);
      pp[i * 3] = rr * Math.sin(ph) * Math.cos(th); pp[i * 3 + 1] = rr * Math.sin(ph) * Math.sin(th); pp[i * 3 + 2] = rr * Math.cos(ph);
    }
    const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pp, 3));
    const pm = new THREE.Points(pg, new THREE.PointsMaterial({ size: .05, color: 0xffa6ff, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false }));
    sc.add(pm);
    let px = 0, py = 0, vis = true, run = false;
    const t0 = performance.now();
    const onMove = (e: PointerEvent) => { px = e.clientX / innerWidth - .5; py = e.clientY / innerHeight - .5; };
    addEventListener("pointermove", onMove);
    function size() { if (!cv) return; const w = cv.clientWidth, h = cv.clientHeight; r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    size(); addEventListener("resize", size);
    function frame(ts: number) { const t = (ts - t0) / 1000; mat.uniforms.t.value = t; grp.rotation.y = t * .3; grp.rotation.x = .45 + Math.sin(t * .6) * .12; grp.rotation.z = Math.sin(t * .4) * .15; grp.position.y = Math.sin(t * 1.1) * .12; pm.rotation.y = -t * .08; pm.rotation.x = t * .03; r.render(sc, cam); }
    function loop(ts: number) { if (!vis) { run = false; return; } frame(ts); requestAnimationFrame(loop); }
    function start() { if (run) return; run = true; requestAnimationFrame(loop); }
    const obs = new IntersectionObserver(en => { vis = en[0].isIntersecting; if (vis) start(); });
    obs.observe(cv);
    start();
    return () => { obs.disconnect(); removeEventListener("pointermove", onMove); r.dispose(); };
  }, []);

  useEffect(() => {
    if (!(window as any).THREE) return;
    const THREE = (window as any).THREE;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const vs = `uniform float t,a;varying vec3 n;varying vec3 v;void main(){vec3 p=position+normal*a*(sin(position.x*2.6+t*1.3)+sin(position.y*3.1-t*1.1)+sin(position.z*2.2+t*.9));n=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(p,1.);v=-mv.xyz;gl_Position=projectionMatrix*mv;}`;
    const fs = `varying vec3 n;varying vec3 v;uniform float t,off;vec3 ramp(float x){x=fract(x)*4.;vec3 a=vec3(1.,.24,.94),b=vec3(.35,.24,1.),c=vec3(.2,.78,1.),d=vec3(1.,.54,.17);if(x<1.)return mix(a,b,x);if(x<2.)return mix(b,c,x-1.);if(x<3.)return mix(c,d,x-2.);return mix(d,a,x-3.);}void main(){vec3 N=normalize(n),V=normalize(v);if(dot(N,V)<0.)N=-N;float f=pow(1.-max(dot(N,V),0.),2.);vec3 R=reflect(-V,N);float k=dot(R,vec3(.55,.8,.35))*.9+sin(R.x*3.+t*.5)*.18+sin(R.y*4.-t*.4)*.12+t*.04+off;vec3 col=ramp(k);col*=.25+1.1*smoothstep(-.6,.8,R.y);vec3 L=normalize(vec3(.4,.8,.7));float sp=pow(max(dot(R,L),0.),60.);float dif=max(dot(N,L),0.);col=col*(.6+.5*dif)+sp*vec3(1.)+f*ramp(k+.3)*.8;gl_FragColor=vec4(pow(col,vec3(.92)),1.);}`;
    const cleanups: (() => void)[] = [];
    document.querySelectorAll<HTMLCanvasElement>(".gl2").forEach((cv, idx) => {
      let r: any;
      try { r = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); } catch { return; }
      const knot = cv.dataset.k === "knot";
      const geo = knot ? new THREE.TorusKnotGeometry(1.25, .36, 260, 40, 2, 5) : new THREE.IcosahedronGeometry(1.7, 6);
      const mat = new THREE.ShaderMaterial({ uniforms: { t: { value: 0 }, a: { value: knot ? .03 : .13 }, off: { value: knot ? .7 : .35 } }, vertexShader: vs, fragmentShader: fs, side: THREE.DoubleSide });
      const m = new THREE.Mesh(geo, mat), sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, 1, .1, 60);
      cam.position.z = knot ? 8.2 : 7.4; sc.add(m);
      function size() { const w = cv.clientWidth, h = cv.clientHeight; r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
      size();
      const onResize = () => size();
      addEventListener("resize", onResize);
      let t0 = 0, vis = false, run = false;
      function frame(ts: number) { const t = still ? 3 : (ts - t0) / 1000; mat.uniforms.t.value = t; m.rotation.y = still ? .6 : t * (knot ? -.35 : .25); m.rotation.x = .4 + t * (knot ? .22 : .12); m.rotation.z = Math.sin(t * .5) * .2; m.position.y = Math.sin(t * 1.2 + idx) * .12; r.render(sc, cam); }
      function loop(ts: number) { if (!vis) { run = false; return; } frame(ts); requestAnimationFrame(loop); }
      function start() { if (run || still) return; run = true; requestAnimationFrame(loop); }
      const obs = new IntersectionObserver(en => { vis = en[0].isIntersecting; if (vis) { if (!t0) t0 = performance.now(); start(); } }, { threshold: .1 });
      obs.observe(cv);
      if (still) frame(0);
      cleanups.push(() => { obs.disconnect(); removeEventListener("resize", onResize); r.dispose(); });
    });
    return () => cleanups.forEach(fn => fn());
  }, []);

  async function sendChat(text: string) {
    text = text.trim(); if (!text) return;
    setInput("");
    setChatLog(l => [...l, { role: "me", text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }) });
      const data = await res.json();
      setChatLog(l => [...l, { role: "ai", text: data.reply }]);
    } catch {
      setChatLog(l => [...l, { role: "ai", text: "Sorry, something went wrong. Please try again." }]);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setFormStatus(null);
    setFormSending(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) { setFormStatus({ type: "success", msg: "Message sent! We'll reply within one working day." }); formRef.current?.reset(); }
      else setFormStatus({ type: "error", msg: data.error || "Something went wrong." });
    } catch {
      setFormStatus({ type: "error", msg: "Network error. Please try again." });
    }
    setFormSending(false);
  }

  const marqItems = [...TECHS, ...TECHS];

  return (
    <>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" async />

      <nav>
        <div className="wrap">
          <a className="logo" href="#top"><b></b>Axiora</a>
          <div className="links">
            <a href="#services">Services</a>
            <a href="#work">Work</a>
            <a href="#faq">FAQ</a>
            <a href="#contact" className="btn">Start a project</a>
          </div>
        </div>
      </nav>

      <main id="top">
        <header className="hero">
          <div className="wrap top">
            <div>
              <h1>Software that thinks alongside your business</h1>
              <p className="lead">A Lahore based engineering team building web platforms, cloud systems and AI products for companies that want to move faster.</p>
              <div className="users">
                <div className="av">
                  <b style={{ ["--g" as any]: "linear-gradient(135deg,#ff9b3d,#ff4fb0)" }}></b>
                  <b style={{ ["--g" as any]: "linear-gradient(135deg,#4d7cff,#2fd5ff)" }}></b>
                  <b style={{ ["--g" as any]: "linear-gradient(135deg,#e93cff,#6a3cff)" }}></b>
                </div>
                <div><strong>60+</strong>Products shipped for happy clients</div>
              </div>
              <div className="cta">
                <a className="btn blue" href="#contact">Book a free consultation</a>
                <a className="btn mag" href="#services">See what we build</a>
              </div>
            </div>
            <div className="orb">
              <i className="ring" aria-hidden="true"></i>
              <canvas ref={glRef} id="gl" aria-hidden="true"></canvas>
              <span className="chip c1">AI integration</span>
              <span className="chip c2">Cloud native</span>
              <span className="chip c3">Secure by design</span>
              <div className="statcard">
                <small>Years of engineering</small>
                <b>13+</b>
                <div className="bars" aria-hidden="true">
                  {["40%","70%","50%","90%","60%","100%","45%"].map((h, i) => <i key={i} style={{ height: h }}></i>)}
                </div>
              </div>
            </div>
          </div>
          <div className="stage2">
            <div className="arc" aria-hidden="true"></div>
            <div className="spot" aria-hidden="true"></div>
            <div className="wrap nums">
              <div><b>60+</b><small>Products shipped</small></div>
              <div><b>25</b><small>Engineers and designers</small></div>
              <div><b>12</b><small>Countries served</small></div>
              <div><b>99%</b><small>Client retention</small></div>
            </div>
          </div>
        </header>

        <div className="marq" aria-hidden="true">
          <div>{marqItems.map((t, i) => <span key={i}>{t}</span>)}</div>
        </div>

        <section id="services" className="glowbg">
          <div className="wrap">
            <h2>Everything from first sketch to production</h2>
            <p className="sub">One team across design, code, cloud and AI, so nothing gets lost between handoffs.</p>
            <div className="grid">
              {SERVICES.map(([ico, title, desc]) => (
                <div className="svc" key={title as string}>
                  <div className="ico">{ico}</div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ai glowbg">
          <div className="wrap g">
            <div>
              <h2>Not sure what you need? Ask our AI first</h2>
              <p className="sub">Describe your idea in plain words, in English or Roman Urdu. You get a suggested service and a rough timeline in seconds.</p>
              <div className="orb sm"><i className="ring" aria-hidden="true"></i><canvas className="gl2" aria-hidden="true"></canvas></div>
            </div>
            <div className="chat" aria-label="AI assistant">
              <header><span className="dot"></span>Ask Axiora AI</header>
              <div className="log" ref={logRef} aria-live="polite">
                {chatLog.map((m, i) => <div key={i} className={`msg ${m.role}`}>{m.text}</div>)}
                {loading && <div className="msg ai">Thinking...</div>}
              </div>
              <div className="chips">
                {["I need a mobile app","Automate support with AI","Move to AWS"].map(t => (
                  <button key={t} onClick={() => sendChat(t)}>{t}</button>
                ))}
              </div>
              <div className="ask">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat(input)} placeholder="Describe your idea" aria-label="Your question" autoComplete="off" />
                <button className="btn" onClick={() => sendChat(input)}>Send</button>
              </div>
            </div>
          </div>
        </section>

        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <h2>How a project runs with us</h2>
            <div className="steps">
              {[["1","Discover","A short workshop to map goals, users and constraints."],["2","Design","Clickable prototypes you can test before any code exists."],["3","Build","Two week sprints, each ending with a working demo."],["4","Scale","Launch, monitor and improve with a team on call."]].map(([n,t,d]) => (
                <div className="step" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>
              ))}
            </div>
          </div>
        </section>

        <div className="planet">
          <div className="arc" aria-hidden="true"></div>
          <div className="spot" aria-hidden="true"></div>
          <div className="pc"><h3>Built to launch fast and built to last</h3><p>Monitoring, support and improvements keep going long after your product is live.</p></div>
        </div>

        <section id="work" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <h2>AI capabilities we ship</h2>
            <p className="sub">From raw idea to production-grade AI — we handle the full stack.</p>
            <div className="work">
              <div className="case"><div><small>Large Language Models</small><h3>LLM Integration</h3><p>We integrate and fine-tune LLMs like Gemini, GPT and open-source models into your product — chat, search, summarization and more.</p></div><strong>GPT · Gemini · Llama</strong></div>
              <div className="case"><div><small>Retrieval Augmented Generation</small><h3>RAG Systems</h3><p>Private knowledge bases that let your AI answer from your own documents, databases and internal data — no hallucinations.</p></div><strong>Accurate answers</strong></div>
              <div className="case"><div><small>Safety & Reliability</small><h3>AI Guardrails</h3><p>We add content filters, output validation and fallback logic so your AI stays on-topic, safe and compliant in production.</p></div><strong>Safe by design</strong></div>
              <div className="case"><div><small>Workflow Automation</small><h3>AI Automation</h3><p>We automate repetitive business workflows using AI agents — from data processing and report generation to email triage and approvals.</p></div><strong>80% less manual work</strong></div>
            </div>
            <div className="quotes">
              <blockquote><p>RAG pipeline cut our support tickets by half — the AI actually knows our product.</p><cite>Head of Support, fintech startup</cite></blockquote>
              <blockquote><p>Guardrails gave our legal team confidence to approve the AI rollout in two weeks.</p><cite>CTO, enterprise SaaS</cite></blockquote>
              <blockquote><p>The automation they built handles 80% of our data processing without human input.</p><cite>Operations Director, logistics company</cite></blockquote>
            </div>
          </div>
        </section>

        <section id="about" className="glowbg">
          <div className="wrap about">
            <h2>A small team with big system habits</h2>
            <div>
              <p>Axiora started from a simple belief: most businesses don't need more software, they need software that fits how they already work. We build around your workflow instead of asking you to change it.</p>
              <p>Our engineers have shipped contact centers, CRMs, marketplaces and internal tools on AWS, and we add AI only where it saves real time for real people.</p>
              <div className="orb sm"><canvas className="gl2" data-k="knot" aria-hidden="true"></canvas></div>
            </div>
          </div>
        </section>

        <section id="faq" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <h2>Questions we hear first</h2>
            <div className="faq">
              {[["How much does a project cost?","It depends on scope. After a short call we send a fixed range with a clear list of what is included."],["How long until we see something working?","Most clients see a clickable prototype within two weeks and a working build within the first month."],["Who owns the code?","You do. We hand over full source code and documentation, and we are happy to sign an NDA first."],["Do you support the product after launch?","Yes. Monthly plans cover monitoring, fixes and new features."]].map(([q, a]) => (
                <details key={q as string}><summary>{q}</summary><p>{a}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="contact glowbg">
          <div className="wrap g">
            <div>
              <h2>Tell us what you&apos;re building</h2>
              <ul>
                <li>ahmadmujtaba826@gmail.com</li>
                <li>+923295405754</li>
                <li>Lahore, Pakistan</li>
              </ul>
            </div>
            <form ref={formRef} onSubmit={handleSubmit}>
              <input name="n" placeholder="Your name" required />
              <input name="e" type="email" placeholder="Work email" required />
              <select name="s">
                <option>Web development</option>
                <option>Mobile apps</option>
                <option>AI solutions</option>
                <option>Cloud and DevOps</option>
                <option>UI and UX design</option>
                <option>Data and analytics</option>
              </select>
              <textarea name="m" placeholder="What should we know about the project?" required></textarea>
              {formStatus && <div className={`form-status ${formStatus.type}`}>{formStatus.msg}</div>}
              <button className="btn" type="submit" disabled={formSending} style={{ opacity: formSending ? 0.7 : 1, cursor: formSending ? "not-allowed" : "pointer" }}>
                {formSending ? "Sending..." : "Send message"}
              </button>
            </form>
          </div>
        </section>

        <div className="planet b">
          <div className="arc" aria-hidden="true"></div>
          <div className="spot" aria-hidden="true"></div>
          <div className="pc">
            <h3>Ready when you are</h3>
            <p>Tell us what you&apos;re building and we&apos;ll reply within one working day.</p>
            <a className="btn blue" href="#contact">Email the team</a>
          </div>
        </div>
      </main>

      <footer>
        <div className="wrap">
          <span>© 2026 Axiora Technologies</span>
          <span>LinkedIn · GitHub · Instagram</span>
        </div>
      </footer>
    </>
  );
}
