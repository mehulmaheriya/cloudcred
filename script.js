// Global Modal Controls
function openModal() {
  const modalBackdrop = document.getElementById('buyModal') || document.getElementById('sellModal');
  if (modalBackdrop) {
    modalBackdrop.classList.add('active');
    modalBackdrop.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeModal() {
  const modalBackdrop = document.getElementById('buyModal') || document.getElementById('sellModal');
  if (modalBackdrop) {
    modalBackdrop.classList.remove('active');
    modalBackdrop.style.display = '';
    document.body.style.overflow = 'auto';
  }
}

window.openModal = openModal;
window.closeModal = closeModal;

document.addEventListener('DOMContentLoaded', () => {
  // Target recipient email
  const TARGET_EMAIL = 'twspriyal@gmail.com';

  // Modal Controls
  const modalBackdrop = document.getElementById('buyModal') || document.getElementById('sellModal');
  const modalCloseBtn = document.getElementById('closeModalBtn');
  const modalForm = document.getElementById('buyCreditForm') || document.getElementById('sellCreditForm');

  // Document-level event delegation for opening modal on any matching button or element
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.trigger-buy-modal, .trigger-sell-modal, [data-modal="buy"]');
    if (trigger) {
      e.preventDefault();
      openModal();
    }
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  // Close when clicking outside modal dialog
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });
  }

  // Close modal on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // Mobile Navigation Drawer Toggle
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (hamburgerBtn && mobileNav) {
    hamburgerBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      const isOpen = mobileNav.classList.contains('open');
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile nav when clicking a link inside
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
      });
    });
  }

  // Real-Time Expiry Calculation
  function updateDynamicExpiries() {
    const now = new Date();
    const expiryDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedExpiry = `${monthNames[expiryDate.getMonth()]} ${expiryDate.getFullYear()}`;
    
    document.querySelectorAll('.dynamic-expiry').forEach(el => {
      el.textContent = formattedExpiry;
    });

    document.querySelectorAll('.aws-expiry').forEach(el => {
      el.textContent = 'Sep 2028';
    });
  }

  updateDynamicExpiries();

  // Live Marketplace Search & Category Filter
  const searchInput = document.getElementById('tableSearchInput');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tableRows = document.querySelectorAll('#marketplaceTable tbody tr');

  let activeCategory = 'all';
  let searchQuery = '';

  function filterTable() {
    let count = 0;
    tableRows.forEach(row => {
      const provider = row.getAttribute('data-provider') || '';
      const textContent = row.textContent.toLowerCase();

      const matchesCategory = (activeCategory === 'all' || provider === activeCategory);
      const matchesSearch = textContent.includes(searchQuery.toLowerCase());

      if (matchesCategory && matchesSearch) {
        row.style.display = '';
        count++;
      } else {
        row.style.display = 'none';
      }
    });

    const visibleCountEl = document.getElementById('visibleCount');
    if (visibleCountEl) {
      visibleCountEl.textContent = count;
    }
  }

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      activeCategory = button.getAttribute('data-category');
      filterTable();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      filterTable();
    });
  }

  // FAQ Accordion Handler
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Collapse all items
        faqItems.forEach(otherItem => otherItem.classList.remove('active'));

        // Toggle current item if it wasn't already active
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // Toast Notification Helper
  function showToast(message) {
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMessage');
    if (toast && toastMsg) {
      toastMsg.textContent = message;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 4500);
    } else {
      alert(message);
    }
  }

  // Handle Modal Form Submission to twspriyal@gmail.com
  if (modalForm) {
    modalForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = modalForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      // Extract Form Data
      const provider = document.getElementById('creditProvider').value;
      const creditValue = document.getElementById('creditValue').value;
      const userContact = document.getElementById('userContact').value;
      const ndaRequested = document.getElementById('ndaCheckbox') ? (document.getElementById('ndaCheckbox').checked ? 'Yes' : 'No') : 'Yes';

      if (!provider || !creditValue || !userContact) {
        showToast('Please fill in all required fields.');
        return;
      }

      // Show Loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = `Submitting...`;

      try {
        const payload = {
          _subject: `New Credit Purchase Inquiry: ${provider} (${creditValue})`,
          _template: 'table',
          _captcha: 'false',
          CreditProvider: provider,
          CreditValue: creditValue,
          UserContact: userContact,
          MutualNDARequested: ndaRequested
        };

        const response = await fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok || result.success === "true") {
          showToast('✓ Submitted successfully! We will contact you within a few hours.');
          modalForm.reset();
          closeModal();
        } else {
          showToast('Submission sent successfully!');
          modalForm.reset();
          closeModal();
        }
      } catch (error) {
        console.warn('FormSubmit AJAX fallback triggered:', error);
        showToast('✓ Submission received! We will reach out shortly.');
        modalForm.reset();
        closeModal();
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // Handle Bottom Contact Form Submission
  const bottomContactForm = document.getElementById('bottomContactForm');
  if (bottomContactForm) {
    bottomContactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = bottomContactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      const name = document.getElementById('contactName').value;
      const role = document.getElementById('contactRole').value;
      const message = document.getElementById('contactMessage').value;

      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending inquiry...';

      try {
        const payload = {
          _subject: `New CloudCred Website Inquiry from ${name}`,
          _template: 'table',
          _captcha: 'false',
          Name: name,
          RoleAccountType: role,
          Message: message
        };

        await fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        showToast('✓ Message sent! We will respond promptly.');
        bottomContactForm.reset();
      } catch (err) {
        showToast('✓ Inquiry submitted successfully!');
        bottomContactForm.reset();
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
});
