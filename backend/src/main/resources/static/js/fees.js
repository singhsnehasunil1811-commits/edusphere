// STUDENT360 — Fees & Payment Management Module
const Fees = {
  list: [],

  async init() {
    if (Auth.isStudent()) {
      await this.loadMyFees();
    } else {
      await this.loadFeesList();
    }
  },

  async loadFeesList() {
    const tbody = document.getElementById('fees-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:24px;">Loading fee records...</td></tr>';

    try {
      this.list = await API.get('/fees') || [];
      this.renderTable(this.list);
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--danger); padding:24px;">${err.message}</td></tr>`;
    }
  },

  renderTable(items) {
    const tbody = document.getElementById('fees-table-body');
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:24px; color:var(--text-muted);">No fee records found.</td></tr>';
      return;
    }

    const isAdmin = Auth.isAdmin();

    tbody.innerHTML = items.map(f => `
      <tr>
        <td><b>${f.studentRoll}</b></td>
        <td>${f.studentName}</td>
        <td>${f.academicYear}</td>
        <td>₹${f.totalFees.toLocaleString()}</td>
        <td style="color:#10b981;">₹${f.paidAmount.toLocaleString()}</td>
        <td style="color:${f.remaining > 0 ? '#ef4444' : '#10b981'}; font-weight:700;">₹${f.remaining.toLocaleString()}</td>
        <td><span class="badge badge-${f.status.toLowerCase().replace('_', '-')}">${f.status}</span></td>
        <td>
          ${(isAdmin && f.remaining > 0) ? `
            <button class="btn btn-sm btn-primary" onclick="Fees.openPayModal(${f.id}, '${f.studentName}', ${f.remaining})">
              💳 Record Payment
            </button>
          ` : '-'}
        </td>
      </tr>
    `).join('');
  },

  openPayModal(feeId, studentName, remaining) {
    document.getElementById('pay-fee-id').value = feeId;
    document.getElementById('pay-student-name').textContent = studentName;
    document.getElementById('pay-remaining-amount').textContent = `₹${remaining.toLocaleString()}`;
    document.getElementById('pay-amount-input').value = remaining;
    document.getElementById('pay-amount-input').max = remaining;
    document.getElementById('fee-pay-modal').classList.add('active');
  },

  async recordPayment(event) {
    event.preventDefault();
    const feeId = document.getElementById('pay-fee-id').value;
    const amount = Number(document.getElementById('pay-amount-input').value);
    const remarks = document.getElementById('pay-remarks-input').value.trim();

    try {
      await API.post(`/fees/${feeId}/pay`, {
        amount: amount,
        paymentDate: new Date().toISOString().split('T')[0],
        remarks: remarks || 'Counter payment'
      });
      API.toast('Payment recorded successfully!', 'success');
      document.getElementById('fee-pay-modal').classList.remove('active');
      await this.loadFeesList();
      Dashboard.loadStats();
    } catch (err) {
      API.toast(err.message, 'error');
    }
  },

  async loadMyFees() {
    const container = document.getElementById('my-fees-container');
    if (!container) return;

    try {
      const records = await API.get('/fees/my') || [];
      if (records.length === 0) {
        container.innerHTML = '<div style="color:var(--text-muted); padding:20px;">No fee statements found.</div>';
        return;
      }

      container.innerHTML = records.map(f => `
        <div class="glass" style="padding:24px; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h3>Academic Year: ${f.academicYear}</h3>
            <span class="badge badge-${f.status.toLowerCase().replace('_', '-')}">${f.status}</span>
          </div>
          <div class="stats-grid" style="margin-bottom:16px;">
            <div class="stat-card glass"><div class="stat-content"><div class="stat-number">₹${f.totalFees.toLocaleString()}</div><div class="stat-label">Total Fees</div></div></div>
            <div class="stat-card glass"><div class="stat-content"><div class="stat-number" style="color:#10b981">₹${f.paidAmount.toLocaleString()}</div><div class="stat-label">Paid Amount</div></div></div>
            <div class="stat-card glass"><div class="stat-content"><div class="stat-number" style="color:${f.remaining > 0 ? '#ef4444' : '#10b981'}">₹${f.remaining.toLocaleString()}</div><div class="stat-label">Remaining Balance</div></div></div>
          </div>
          <p style="font-size:0.85rem; color:var(--text-muted); margin:0;">Due Date: <b>${f.dueDate}</b> · Remarks: ${f.remarks || 'None'}</p>
        </div>
      `).join('');
    } catch (err) {
      container.innerHTML = `<div style="color:var(--danger); padding:20px;">${err.message}</div>`;
    }
  }
};
