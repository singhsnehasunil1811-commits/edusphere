// STUDENT360 — Dashboard, 3D Tilt, Particle Animation & Charts Module
const Dashboard = {
  stats: null,

  async init() {
    this.initParticles();
    this.init3DTilt();
    await this.loadStats();
  },

  async loadStats() {
    try {
      const data = await API.get('/dashboard/stats');
      this.stats = data;
      this.renderCounters(data);
      this.renderCharts(data);
      this.renderRecentNotices(data.recentNotices || []);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      API.toast('Could not refresh dashboard metrics', 'error');
    }
  },

  animateCounter(el, target, suffix = '') {
    if (!el) return;
    const duration = 1200;
    const start = 0;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.floor(start + (target - start) * ease);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString() + suffix;
      }
    }
    requestAnimationFrame(update);
  },

  renderCounters(data) {
    const totalStudentsEl = document.getElementById('stat-total-students');
    const totalTeachersEl = document.getElementById('stat-total-teachers');
    const totalCoursesEl = document.getElementById('stat-total-courses');
    const totalDeptsEl = document.getElementById('stat-total-depts');
    const avgAttendanceEl = document.getElementById('stat-avg-attendance');
    const avgMarksEl = document.getElementById('stat-avg-marks');
    const pendingFeesEl = document.getElementById('stat-pending-fees');

    if (totalStudentsEl) this.animateCounter(totalStudentsEl, data.totalStudents || 0);
    if (totalTeachersEl) this.animateCounter(totalTeachersEl, data.totalTeachers || 0);
    if (totalCoursesEl) this.animateCounter(totalCoursesEl, data.totalCourses || 0);
    if (totalDeptsEl) this.animateCounter(totalDeptsEl, data.totalDepartments || 0);
    if (avgAttendanceEl) {
      avgAttendanceEl.textContent = (data.averageAttendance || 0) + '%';
    }
    if (avgMarksEl) {
      avgMarksEl.textContent = (data.averageMarks || 0) + '%';
    }
    if (pendingFeesEl) {
      const amount = data.pendingFees && data.pendingFees.pendingAmount ? data.pendingFees.pendingAmount : 0;
      pendingFeesEl.textContent = '₹' + amount.toLocaleString();
    }
  },

  renderCharts(data) {
    this.drawDepartmentChart(data.studentsByDepartment || {});
    this.drawPerformanceChart(data.performanceDistribution || {});
    this.drawAttendanceGauge(data.averageAttendance || 0);
  },

  drawDepartmentChart(deptMap) {
    const canvas = document.getElementById('chart-departments');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const keys = Object.keys(deptMap);
    if (keys.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No department data available', w / 2, h / 2);
      return;
    }

    const values = Object.values(deptMap);
    const maxVal = Math.max(...values, 1);
    const padding = 40;
    const bottomPad = 50;
    const chartW = w - padding * 2;
    const chartH = h - padding - bottomPad;
    const barWidth = Math.min(50, (chartW / keys.length) * 0.55);
    const gap = chartW / keys.length;

    keys.forEach((key, i) => {
      const val = deptMap[key];
      const barH = (val / maxVal) * chartH;
      const x = padding + i * gap + (gap - barWidth) / 2;
      const y = h - bottomPad - barH;

      // Gradient bar
      const grad = ctx.createLinearGradient(0, y, 0, h - bottomPad);
      grad.addColorStop(0, '#8b5cf6');
      grad.addColorStop(1, '#06b6d4');
      ctx.fillStyle = grad;

      // Rounded top bar
      const radius = 6;
      ctx.beginPath();
      ctx.moveTo(x, h - bottomPad);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, h - bottomPad);
      ctx.closePath();
      ctx.fill();

      // Value label on top
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(val, x + barWidth / 2, y - 8);

      // Label at bottom
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      const label = key.length > 10 ? key.substring(0, 8) + '..' : key;
      ctx.fillText(label, x + barWidth / 2, h - bottomPad + 18);
    });
  },

  drawPerformanceChart(gradeMap) {
    const canvas = document.getElementById('chart-grades');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const colors = {
      'A+': '#10b981',
      'A': '#06b6d4',
      'B+': '#6366f1',
      'B': '#8b5cf6',
      'C': '#f59e0b',
      'D': '#f97316',
      'F': '#ef4444'
    };

    const keys = Object.keys(gradeMap);
    const total = Object.values(gradeMap).reduce((a, b) => a + b, 0);

    if (total === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No marks data available', w / 2, h / 2);
      return;
    }

    const centerX = w * 0.35;
    const centerY = h * 0.5;
    const outerR = Math.min(centerX, centerY) - 20;
    const innerR = outerR * 0.6;

    let startAngle = -Math.PI / 2;

    keys.forEach(k => {
      const val = gradeMap[k] || 0;
      if (val === 0) return;
      const sliceAngle = (val / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerR, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerR, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = colors[k] || '#8b5cf6';
      ctx.fill();

      startAngle += sliceAngle;
    });

    // Donut center text
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total, centerX, centerY - 6);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Records', centerX, centerY + 14);

    // Legend on the right
    const legendX = w * 0.68;
    let legendY = 30;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    keys.forEach(k => {
      const val = gradeMap[k] || 0;
      ctx.fillStyle = colors[k] || '#8b5cf6';
      ctx.fillRect(legendX, legendY, 12, 12);

      ctx.fillStyle = '#f1f5f9';
      ctx.font = '12px sans-serif';
      ctx.fillText(`${k} : ${val}`, legendX + 20, legendY + 6);
      legendY += 24;
    });
  },

  drawAttendanceGauge(avgPercentage) {
    const canvas = document.getElementById('chart-attendance-gauge');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h * 0.6;
    const radius = Math.min(w, h) * 0.42;

    // Background Arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
    ctx.lineWidth = 14;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Value Arc
    const pct = Math.max(0, Math.min(100, avgPercentage));
    const endAngle = Math.PI + (pct / 100) * Math.PI;

    const grad = ctx.createLinearGradient(0, centerY, w, centerY);
    grad.addColorStop(0, '#ef4444');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(1, '#10b981');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, endAngle);
    ctx.lineWidth = 14;
    ctx.strokeStyle = grad;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Center Percentage
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pct + '%', centerX, centerY - 10);

    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Average Campus Attendance', centerX, centerY + 20);
  },

  renderRecentNotices(notices) {
    const container = document.getElementById('recent-notices-list');
    if (!container) return;

    if (notices.length === 0) {
      container.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:20px;">No recent notices</div>';
      return;
    }

    container.innerHTML = notices.slice(0, 4).map(n => `
      <div class="glass" style="padding:14px; margin-bottom:10px; border-left:4px solid ${
        n.priority === 'URGENT' ? '#ef4444' : (n.priority === 'IMPORTANT' ? '#f59e0b' : '#06b6d4')
      }">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <h4 style="font-size:0.92rem; margin:0;">${n.title}</h4>
          <span class="badge badge-${n.priority.toLowerCase()}">${n.priority}</span>
        </div>
        <p style="font-size:0.82rem; color:var(--text-muted); margin:0;">${n.content.substring(0, 95)}...</p>
        <span style="font-size:0.72rem; color:var(--text-muted); display:inline-block; margin-top:6px;">
          📅 ${n.date} · 🎯 Audience: ${n.targetAudience}
        </span>
      </div>
    `).join('');
  },

  init3DTilt() {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      });
    });
  },

  initParticles() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const count = 45;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        color: ['rgba(124, 58, 237, 0.4)', 'rgba(6, 182, 212, 0.4)', 'rgba(236, 72, 153, 0.3)'][Math.floor(Math.random() * 3)]
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
};
