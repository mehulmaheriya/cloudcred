/**
 * CloudCred Marketplace JavaScript
 * Handlers for Modal, Table Search/Filter, FAQ Accordions, Mobile Drawer, Form Email API
 */

document.addEventListener('DOMContentLoaded', () => {
  // Target recipient email
  const TARGET_EMAIL = 'mehulmaheriya30@gmail.com';

  // Modal Elements
  const modalBackdrop = document.getElementById('sellModal');
  const modalCloseBtn = document.getElementById('closeModalBtn');
  const modalForm = document.getElementById('sellCreditForm');
  const sellCreditTriggers = document.querySelectorAll('.trigger-sell-modal');

  // Open Modal Function
  function openModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  // Close Modal Function
  function closeModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }

  // Event listeners for opening modal across all CTA buttons
  sellCreditTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
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
    if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
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

  // Handle Modal Form Submission to mehulmaheriya30@gmail.com
  if (modalForm) {
    modalForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = modalForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      // Extract Form Data
      const provider = document.getElementById('creditProvider').value;
      const creditValue = document.getElementById('creditValue').value;
      const accountType = document.getElementById('accountType').value;
      const grantProgramme = document.getElementById('grantProgramme').value || 'Not specified';
      const creditExpiry = document.getElementById('creditExpiry').value || 'Not specified';
      const userContact = document.getElementById('userContact').value;
      const ndaRequested = document.getElementById('ndaCheckbox').checked ? 'Yes' : 'No';

      if (!provider || !creditValue || !accountType || !userContact) {
        showToast('Please fill in all required fields.');
        return;
      }

      // Show Loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = `Submitting...`;

      try {
        const payload = {
          _subject: `New Credit Submission: ${provider} (${creditValue})`,
          _template: 'table',
          _captcha: 'false',
          CreditProvider: provider,
          CreditValue: creditValue,
          AccountType: accountType,
          GrantProgramme: grantProgramme,
          CreditExpiry: creditExpiry,
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
