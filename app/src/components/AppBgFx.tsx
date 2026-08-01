import { useEffect, useRef } from 'react'

/**
 * Interactive animated background for the logged-in app shell.
 * Ported from the client's reference demo (index.html #heroBg):
 * floating labelled nodes, drifting edges, a mouse-repel field,
 * a mouse trail, twinkling stars, nebula orbs, a dot grid, a scan
 * line, a vignette — and CLICK BURSTS (particles + rings + new nodes).
 *
 * Renders a fixed full-viewport canvas behind the app content. Pointer
 * events pass through except that we listen on window for move/click.
 */
export default function AppBgFx() {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    let W = 0
    let H = 0
    let raf = 0
    const mouse = { x: -9999, y: -9999 }
    const C = ['#6ee7b7', '#60a5fa', '#a78bfa', '#fb923c', '#f472b6', '#34d399', '#fbbf24']
    // training / LMS vocabulary — matches Cordoba's idea (not generic PM words)
    const LABELS = ['Enrol', 'Attendance', 'Batch', 'Grade', 'Certificate', 'Trainer', 'Learner', 'Course', 'Module', 'Quiz', 'Report', 'Compliance', 'Tamkeen', 'Audit', 'Schedule', 'Register']
    const SHAPES = ['rect', 'diamond', 'hex', 'pill', 'circle']
    const rand = (a: number, b: number) => a + Math.random() * (b - a)
    const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    type Star = { x: number; y: number; r: number; a: number; twinkle: number; speed: number }
    type ConstNode = { x: number; y: number; vx: number; vy: number }

    let stars: Star[] = []
    let constNodes: ConstNode[] = []
    let streams: Stream[] = []
    let nodes: Node[] = []
    let edges: Edge[] = []
    let bursts: Burst[] = []
    let scan: Scan | null = null
    let trail: { x: number; y: number; t: number }[] = []
    let lastSpawn = 0
    let lastEdge = 0

    const orbs = [
      { ox: 0.12, oy: 0.18, r: 0.32, c: '#6ee7b7', sp: 0.00018, ph: 0 },
      { ox: 0.88, oy: 0.72, r: 0.28, c: '#a78bfa', sp: 0.00013, ph: 2.1 },
      { ox: 0.5, oy: 0.9, r: 0.22, c: '#60a5fa', sp: 0.00021, ph: 4.2 },
      { ox: 0.75, oy: 0.15, r: 0.2, c: '#fb923c', sp: 0.00016, ph: 1.5 },
      { ox: 0.08, oy: 0.82, r: 0.18, c: '#f472b6', sp: 0.00019, ph: 3.7 },
    ]

    class Stream {
      x = 0; y = 0; len = 0; speed = 0; color = ''; alpha = 0; w = 0
      constructor() { this.reset() }
      reset() { this.x = rand(0, W); this.y = rand(-H, 0); this.len = rand(60, 200); this.speed = rand(1.5, 4); this.color = pick(C); this.alpha = rand(0.04, 0.14); this.w = rand(0.5, 1.5) }
      update() { this.y += this.speed; if (this.y > H + this.len) this.reset() }
      draw() {
        const g = ctx!.createLinearGradient(0, this.y - this.len, 0, this.y)
        g.addColorStop(0, 'transparent')
        g.addColorStop(0.7, this.color + Math.floor(this.alpha * 255).toString(16).padStart(2, '0'))
        g.addColorStop(1, this.color + 'ff')
        ctx!.strokeStyle = g; ctx!.lineWidth = this.w; ctx!.beginPath(); ctx!.moveTo(this.x, this.y - this.len); ctx!.lineTo(this.x, this.y); ctx!.stroke()
      }
    }

    class Scan {
      y = -100; speed = rand(0.4, 0.7)
      update() { this.y += this.speed; if (this.y > H + 100) this.y = -100 }
      draw() {
        const g = ctx!.createLinearGradient(0, this.y - 60, 0, this.y + 60)
        g.addColorStop(0, 'transparent'); g.addColorStop(0.5, 'rgba(110,231,183,0.025)'); g.addColorStop(1, 'transparent')
        ctx!.fillStyle = g; ctx!.fillRect(0, this.y - 60, W, 120)
        ctx!.beginPath(); ctx!.moveTo(0, this.y); ctx!.lineTo(W, this.y); ctx!.strokeStyle = 'rgba(110,231,183,0.06)'; ctx!.lineWidth = 1; ctx!.stroke()
      }
    }

    class Node {
      x = 0; y = 0; vx = 0; vy = 0; ax = 0; ay = 0; explosive = false; alpha = 0
      w = 0; h = 0; shape = 'rect'; color = ''; label = ''
      pulse = 0; rotation = 0; rotSpeed = 0
      life = 0; maxLife = 0; selected = false; hovered = false
      flyTarget: { vx: number; vy: number; spin: number } | null = null
      hasComment = false; hasAttach = false; scale = 1; targetScale = 1
      constructor(fromClick?: { x: number; y: number }) {
        if (fromClick) {
          this.x = fromClick.x + rand(-1, 1) * 80; this.y = fromClick.y + rand(-1, 1) * 80
          this.vx = rand(-3, 3); this.vy = rand(-4, -1); this.ax = 0; this.ay = 0.04; this.explosive = true; this.alpha = 0
        } else {
          const edge = Math.floor(Math.random() * 4)
          if (edge === 0) { this.x = rand(0, W); this.y = -70 }
          else if (edge === 1) { this.x = W + 70; this.y = rand(0, H) }
          else if (edge === 2) { this.x = rand(0, W); this.y = H + 70 }
          else { this.x = -70; this.y = rand(0, H) }
          const cx = W / 2, cy = H / 2, ang = Math.atan2(cy - this.y, cx - this.x) + rand(-0.6, 0.6), spd = rand(0.2, 0.7)
          this.vx = Math.cos(ang) * spd; this.vy = Math.sin(ang) * spd; this.ax = 0; this.ay = 0; this.explosive = false; this.alpha = 0
        }
        this.w = rand(90, 150); this.h = rand(32, 46); this.shape = pick(SHAPES); this.color = pick(C); this.label = pick(LABELS)
        this.pulse = rand(0, Math.PI * 2); this.rotation = rand(-0.15, 0.15); this.rotSpeed = rand(-0.003, 0.003)
        this.life = 0; this.maxLife = fromClick ? rand(120, 220) : rand(350, 600)
        this.hasComment = Math.random() < 0.35; this.hasAttach = Math.random() < 0.25; this.scale = fromClick ? 0.1 : 1; this.targetScale = 1
      }
      contains(mx: number, my: number) {
        const dx = mx - this.x, dy = my - this.y, cos = Math.cos(-this.rotation), sin = Math.sin(-this.rotation), lx = cos * dx - sin * dy, ly = sin * dx + cos * dy
        return Math.abs(lx) < this.w / 2 + 8 && Math.abs(ly) < this.h / 2 + 8
      }
      select() {
        if (this.selected) return
        this.selected = true
        const angle = Math.random() * Math.PI * 2
        this.flyTarget = { vx: Math.cos(angle) * rand(4, 8), vy: Math.sin(angle) * rand(4, 8), spin: rand(-0.08, 0.08) * 3 }
        this.rotSpeed = this.flyTarget.spin; this.color = '#6ee7b7'; this.targetScale = 1.15
      }
      update() {
        this.life++; this.pulse += 0.03
        if (this.flyTarget) { this.vx = lerp(this.vx, this.flyTarget.vx, 0.08); this.vy = lerp(this.vy, this.flyTarget.vy, 0.08) }
        this.vx += this.ax; this.vy += this.ay
        if (!this.explosive && !this.flyTarget) {
          this.vx *= 0.998; this.vy *= 0.998
          const dx = this.x - mouse.x, dy = this.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy)
          if (d < 130 && d > 0) { this.vx += (dx / d) * 0.25 * (130 - d) / 130; this.vy += (dy / d) * 0.25 * (130 - d) / 130 }
        }
        this.x += this.vx; this.y += this.vy; this.rotation += this.rotSpeed; this.scale = lerp(this.scale, this.targetScale, 0.12)
        if (!this.selected) {
          if (this.life < 40) this.alpha = Math.min(0.85, this.alpha + 0.025)
          if (this.life > this.maxLife - 50) this.alpha = Math.max(0, this.alpha - 0.02)
        } else this.alpha = Math.max(0, this.alpha - 0.018)
        return this.life > this.maxLife || this.alpha <= 0 || this.x < -200 || this.x > W + 200 || this.y < -200 || this.y > H + 200
      }
      draw() {
        if (this.alpha <= 0) return
        const c = ctx!
        c.save(); c.translate(this.x, this.y); c.rotate(this.rotation); c.scale(this.scale, this.scale); c.globalAlpha = this.alpha
        const w = this.w, h = this.h, hw = w / 2, hh = h / 2, glow = 0.5 + 0.5 * Math.sin(this.pulse), isHov = this.hovered || this.selected
        c.shadowBlur = isHov ? 28 : 12 + glow * 8; c.shadowColor = this.color
        c.fillStyle = this.color + (isHov ? '28' : '14'); c.strokeStyle = this.color + (isHov ? 'cc' : Math.floor(80 + glow * 70).toString(16).padStart(2, '0')); c.lineWidth = isHov ? 2 : 1.2
        c.beginPath()
        if (this.shape === 'rect') c.roundRect(-hw, -hh, w, h, 8)
        else if (this.shape === 'diamond') { c.moveTo(0, -hh); c.lineTo(hw, 0); c.lineTo(0, hh); c.lineTo(-hw, 0); c.closePath() }
        else if (this.shape === 'hex') { for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 - Math.PI / 6; i === 0 ? c.moveTo(hw * Math.cos(a), hh * Math.sin(a)) : c.lineTo(hw * Math.cos(a), hh * Math.sin(a)) } c.closePath() }
        else if (this.shape === 'pill') c.roundRect(-hw, -hh, w, h, hh)
        else c.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2)
        c.fill(); c.shadowBlur = 0; c.stroke()
        if (this.shape === 'rect' || this.shape === 'pill') { c.beginPath(); c.moveTo(-hw + 10, -hh + 1); c.lineTo(hw - 10, -hh + 1); c.strokeStyle = this.color + '33'; c.lineWidth = 1; c.stroke() }
        c.shadowBlur = 0; c.font = "600 11px 'Segoe UI',sans-serif"; c.fillStyle = isHov ? this.color : this.color + 'cc'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(this.label, 0, 0)
        if (this.hasComment) { c.beginPath(); c.arc(hw - 8, -hh - 6, 5.5, 0, Math.PI * 2); c.fillStyle = '#fbbf24'; c.shadowBlur = 8; c.shadowColor = '#fbbf24'; c.fill(); c.shadowBlur = 0; c.font = 'bold 7px sans-serif'; c.fillStyle = '#000'; c.fillText('!', hw - 8, -hh - 6) }
        if (this.hasAttach) { c.beginPath(); c.arc(hw - 24, -hh - 6, 5.5, 0, Math.PI * 2); c.fillStyle = '#60a5fa'; c.shadowBlur = 8; c.shadowColor = '#60a5fa'; c.fill(); c.shadowBlur = 0 }
        if (this.selected) { c.beginPath(); c.arc(0, 0, Math.max(hw, hh) + 12, 0, Math.PI * 2); c.strokeStyle = this.color + '88'; c.lineWidth = 1.5; c.setLineDash([5, 4]); c.stroke(); c.setLineDash([]) }
        c.restore()
      }
    }

    class Edge {
      a: Node; b: Node
      progress = 0; alpha = 0; color: string; speed = rand(0.003, 0.006); done = false
      constructor(a: Node, b: Node) { this.a = a; this.b = b; this.color = a.color }
      update() { this.progress = Math.min(1, this.progress + this.speed); this.alpha = Math.min(0.45, this.alpha + 0.012); if (this.progress >= 1) this.done = true; if (this.a.alpha <= 0 || this.b.alpha <= 0) this.done = true }
      draw() {
        if (this.alpha <= 0) return
        const c = ctx!, ax = this.a.x, ay = this.a.y, bx = this.b.x, by = this.b.y, mx = (ax + bx) / 2, my = (ay + by) / 2 - 60
        c.save(); c.globalAlpha = this.alpha * (1 - this.progress * 0.5)
        c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(mx, my, bx, by); c.strokeStyle = this.color + '44'; c.lineWidth = 1; c.setLineDash([6, 5]); c.stroke(); c.setLineDash([])
        const t = this.progress, px = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * mx + t * t * bx, py = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * my + t * t * by
        c.beginPath(); c.arc(px, py, 3.5, 0, Math.PI * 2); c.fillStyle = this.color; c.shadowBlur = 12; c.shadowColor = this.color; c.fill(); c.shadowBlur = 0; c.restore()
      }
    }

    class Burst {
      x: number; y: number
      particles: { x: number; y: number; vx: number; vy: number; r: number; color: string; alpha: number; life: number; maxLife: number }[]
      rings: { r: number; maxR: number; alpha: number; color: string }[]
      done = false
      constructor(x: number, y: number) {
        this.x = x; this.y = y
        this.particles = Array.from({ length: 16 }, () => ({ x, y, vx: rand(-6, 6), vy: rand(-6, 6), r: rand(2, 5), color: pick(C), alpha: 1, life: 0, maxLife: rand(30, 60) }))
        this.rings = Array.from({ length: 3 }, (_, i) => ({ r: 10, maxR: 80 + i * 50, alpha: 0.7, color: pick(C) }))
      }
      update() {
        let allDead = true
        this.particles.forEach((p) => { p.vx *= 0.91; p.vy *= 0.91; p.vy += 0.12; p.x += p.vx; p.y += p.vy; p.life++; p.alpha = Math.max(0, 1 - p.life / p.maxLife); if (p.alpha > 0) allDead = false })
        this.rings.forEach((r) => { r.r = Math.min(r.maxR, r.r + 4); r.alpha = Math.max(0, r.alpha - 0.025) })
        if (allDead) this.done = true
      }
      draw() {
        const c = ctx!
        this.particles.forEach((p) => { if (p.alpha <= 0) return; c.save(); c.globalAlpha = p.alpha; c.beginPath(); c.arc(p.x, p.y, p.r, 0, Math.PI * 2); c.fillStyle = p.color; c.shadowBlur = 8; c.shadowColor = p.color; c.fill(); c.shadowBlur = 0; c.restore() })
        this.rings.forEach((r) => { if (r.alpha <= 0) return; c.save(); c.globalAlpha = r.alpha * 0.4; c.beginPath(); c.arc(this.x, this.y, r.r, 0, Math.PI * 2); c.strokeStyle = r.color; c.lineWidth = 1.5; c.stroke(); c.restore() })
      }
    }

    function spawnBurst(x: number, y: number) { bursts.push(new Burst(x, y)); const k = 2 + Math.floor(rand(0, 3)); for (let i = 0; i < k; i++) nodes.push(new Node({ x, y })) }

    function drawStars() { stars.forEach((s) => { s.twinkle += s.speed; const alpha = s.a * (0.6 + 0.4 * Math.sin(s.twinkle)); ctx!.beginPath(); ctx!.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2); ctx!.fillStyle = 'rgba(148,163,184,' + alpha + ')'; ctx!.fill() }) }
    function drawOrbs(t: number) { orbs.forEach((o) => { const px = (o.ox + Math.sin(t * o.sp + o.ph) * 0.08) * W, py = (o.oy + Math.cos(t * o.sp * 1.3 + o.ph) * 0.07) * H, r = o.r * Math.min(W, H); const g = ctx!.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, o.c + '1a'); g.addColorStop(0.5, o.c + '08'); g.addColorStop(1, 'transparent'); ctx!.fillStyle = g; ctx!.beginPath(); ctx!.arc(px, py, r, 0, Math.PI * 2); ctx!.fill() }) }
    function drawGrid() { const sp = 52; for (let x = 0; x < W; x += sp) for (let y = 0; y < H; y += sp) { const dx = x - mouse.x, dy = y - mouse.y, dist = Math.sqrt(dx * dx + dy * dy), a = dist < 200 ? 0.18 * (1 - dist / 200) : 0.04, s = dist < 200 ? 1.2 : 0.7; ctx!.beginPath(); ctx!.arc(x, y, s, 0, Math.PI * 2); ctx!.fillStyle = 'rgba(110,231,183,' + a + ')'; ctx!.fill() } }
    function drawConstellation() {
      constNodes.forEach((n) => { n.x += n.vx; n.y += n.vy; if (n.x < -0.1 || n.x > 1.1) n.vx *= -1; if (n.y < -0.1 || n.y > 1.1) n.vy *= -1 })
      for (let i = 0; i < constNodes.length; i++) {
        for (let j = i + 1; j < constNodes.length; j++) { const a = constNodes[i], b = constNodes[j], dx = (a.x - b.x) * W, dy = (a.y - b.y) * H, d = Math.sqrt(dx * dx + dy * dy); if (d < 160) { ctx!.beginPath(); ctx!.moveTo(a.x * W, a.y * H); ctx!.lineTo(b.x * W, b.y * H); ctx!.strokeStyle = 'rgba(110,231,183,' + (1 - d / 160) * 0.06 + ')'; ctx!.lineWidth = 0.5; ctx!.stroke() } }
        ctx!.beginPath(); ctx!.arc(constNodes[i].x * W, constNodes[i].y * H, 0.9, 0, Math.PI * 2); ctx!.fillStyle = 'rgba(110,231,183,0.15)'; ctx!.fill()
      }
    }
    function drawTrail() { for (let i = 1; i < trail.length; i++) { const a = trail[i - 1], b = trail[i], age = (performance.now() - b.t) / 400, alpha = Math.max(0, (1 - age) * 0.15 * (i / trail.length)); ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y); ctx!.strokeStyle = 'rgba(110,231,183,' + alpha + ')'; ctx!.lineWidth = 2 * (i / trail.length); ctx!.lineCap = 'round'; ctx!.stroke() } }
    function checkHover() { nodes.forEach((n) => { n.hovered = n.contains(mouse.x, mouse.y) }) }
    function spawnLoop(t: number) {
      if (t - lastSpawn > 500 && nodes.length < 32) { nodes.push(new Node()); lastSpawn = t }
      if (t - lastEdge > 800) { const alive = nodes.filter((n) => n.alpha > 0.4 && !n.selected); if (alive.length >= 2) { const a = pick(alive), b = pick(alive); if (a !== b) edges.push(new Edge(a, b)) } lastEdge = t }
    }
    function resize() {
      const r = cv!.getBoundingClientRect()
      W = cv!.width = Math.max(320, Math.round(r.width)); H = cv!.height = Math.max(300, Math.round(r.height))
      stars = Array.from({ length: Math.min(200, Math.round(W * H / 6500)) }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.2, a: Math.random() * 0.5 + 0.05, twinkle: Math.random() * 6.283, speed: rand(0.005, 0.02) }))
      constNodes = Array.from({ length: 44 }, () => ({ x: Math.random() * 1.2 - 0.1, y: Math.random() * 1.2 - 0.1, vx: rand(-0.00008, 0.00008), vy: rand(-0.00008, 0.00008) }))
      streams = Array.from({ length: Math.max(10, Math.round(W / 70)) }, () => new Stream())
      if (!scan) scan = new Scan()
    }
    function seedNodes() { nodes = []; edges = []; bursts = []; const N = Math.min(26, Math.max(12, Math.round(W * H / 48000))); for (let i = 0; i < N; i++) { const n = new Node(); n.x = rand(60, W - 60); n.y = rand(50, H - 50); n.vx = rand(-0.3, 0.3); n.vy = rand(-0.3, 0.3); n.alpha = rand(0.3, 0.8); n.life = rand(50, 200); nodes.push(n) } }
    function draw(t: number) {
      const c = ctx!
      c.fillStyle = '#03050f'; c.fillRect(0, 0, W, H)
      drawOrbs(t); drawConstellation(); drawStars()
      streams.forEach((s) => { s.update(); s.draw() })
      drawGrid(); drawTrail()
      edges = edges.filter((e) => !e.done); edges.forEach((e) => { e.update(); e.draw() })
      nodes = nodes.filter((n) => !n.update()); nodes.forEach((n) => n.draw())
      bursts = bursts.filter((b) => !b.done); bursts.forEach((b) => { b.update(); b.draw() })
      scan!.update(); scan!.draw()
      const vig = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.75)
      vig.addColorStop(0, 'transparent'); vig.addColorStop(0.6, 'rgba(3,5,15,0.2)'); vig.addColorStop(1, 'rgba(3,5,15,0.82)')
      c.fillStyle = vig; c.fillRect(0, 0, W, H)
      checkHover(); spawnLoop(t)
      raf = requestAnimationFrame(draw)
    }

    const toLocal = (e: PointerEvent | MouseEvent) => { const r = cv!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, over: e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom } }
    const onMove = (e: MouseEvent) => { const p = toLocal(e); if (p.over) { mouse.x = p.x; mouse.y = p.y; trail.push({ x: p.x, y: p.y, t: performance.now() }); if (trail.length > 28) trail.shift() } else { mouse.x = -9999; mouse.y = -9999 } }
    const onDown = (e: PointerEvent) => {
      const p = toLocal(e); if (!p.over) return
      let hit = false
      for (let i = nodes.length - 1; i >= 0; i--) { if (nodes[i].contains(p.x, p.y) && !nodes[i].selected) { nodes[i].select(); hit = true; break } }
      if (!hit) spawnBurst(p.x, p.y)
    }
    const onResize = () => resize()
    const onVis = () => { if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = 0 } } else if (!raf) raf = requestAnimationFrame(draw) }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVis)

    resize()
    seedNodes()
    raf = requestAnimationFrame(draw)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90"
    />
  )
}
