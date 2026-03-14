// admin.js - Admin dashboard logic

document.addEventListener('DOMContentLoaded', () => {
    // 1. Protect route
    if (!auth.protectRoute()) return;

    // References
    const adminEventsGrid = document.getElementById('admin-events-grid');
    const searchInput = document.getElementById('search-input');
    const addEventForm = document.getElementById('add-event-form');
    const alterContainer = document.getElementById('admin-alert-container');
    const addEventModalEl = document.getElementById('addEventModal');
    let bsModal;

    if (addEventModalEl) {
        bsModal = new bootstrap.Modal(addEventModalEl);
    }

    const showAlert = (message, type = 'success') => {
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show alert-custom" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        alterContainer.innerHTML = alertHtml;
        
        // Auto dismiss after 3 seconds
        setTimeout(() => {
            const currentAlert = alterContainer.querySelector('.alert');
            if (currentAlert) {
                const bsAlert = new bootstrap.Alert(currentAlert);
                bsAlert.close();
            }
        }, 3000);
    };

    const renderEvents = (events) => {
        if (events.length === 0) {
            adminEventsGrid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted fs-5">No events found mapping the criteria.</p></div>';
            return;
        }

        let html = '';
        events.forEach(evt => {
            html += `
                <div class="col-md-6 col-lg-4" id="event-card-${evt.id}">
                    <div class="card event-card h-100 border-0 shadow-sm">
                        <div class="card-header bg-white pb-2 pt-3 border-0 d-flex justify-content-between align-items-center">
                            <span class="badge bg-secondary">${evt.category}</span>
                            <span class="text-muted small">ID: ${evt.id}</span>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title fw-bold text-dark">${evt.name}</h5>
                            <div class="d-flex mb-2 text-muted">
                                <div class="me-3"><i class="far fa-calendar-alt me-1"></i> ${evt.date}</div>
                                <div><i class="far fa-clock me-1"></i> ${evt.time}</div>
                            </div>
                            <p class="card-text small mb-3">
                                <a href="${evt.url}" target="_blank" class="text-decoration-none"><i class="fas fa-link me-1"></i> ${evt.url}</a>
                            </p>
                            <button class="btn btn-outline-danger w-100 mt-auto btn-delete" data-id="${evt.id}">
                                <i class="fas fa-trash-alt me-1"></i> Delete Event
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        adminEventsGrid.innerHTML = html;

        // Attach delete event listeners
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm(`Are you sure you want to delete event ${id}?`)) {
                    try {
                        await db.deleteEvent(id);
                        // Removing from DOM
                        const cardDiv = document.getElementById(`event-card-${id}`);
                        if (cardDiv) {
                            cardDiv.remove();
                            showAlert(`Event ${id} deleted successfully.`, 'success');
                            
                            // Check if empty now
                            if (adminEventsGrid.children.length === 0) {
                                renderEvents([]);
                            }
                        }
                    } catch (err) {
                        showAlert(`Failed to delete event: ${err}`, 'danger');
                    }
                }
            });
        });
    };

    const loadEvents = async (query = '') => {
        try {
            const events = await db.searchEvents(query);
            renderEvents(events);
        } catch (err) {
            console.error("Failed to load events", err);
            adminEventsGrid.innerHTML = '<div class="col-12 text-center text-danger"><p>Failed to load events.</p></div>';
        }
    };

    // Wait for DB to be ready before loading data
    document.addEventListener('dbReady', () => {
        loadEvents();
    });

    // Handle Search functionality
    if (searchInput) {
        // Debounce search
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                loadEvents(e.target.value.trim());
            }, 300);
        });
    }

    // Handle Add Event Form
    if (addEventForm) {
        addEventForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newEvent = {
                id: document.getElementById('eventId').value.trim(),
                name: document.getElementById('eventName').value.trim(),
                category: document.getElementById('eventCategory').value,
                date: document.getElementById('eventDate').value,
                time: document.getElementById('eventTime').value,
                url: document.getElementById('eventUrl').value.trim()
            };

            try {
                // Check if ID already exists
                const existing = await db.getEventById(newEvent.id);
                if (existing) {
                    alert(`An event with ID ${newEvent.id} already exists! Please use a unique ID.`);
                    return;
                }

                await db.addEvent(newEvent);
                
                // Hide modal & reset form
                if (bsModal) bsModal.hide();
                addEventForm.reset();
                
                // Refresh list
                loadEvents(searchInput ? searchInput.value.trim() : '');
                showAlert(`Event "${newEvent.name}" added successfully.`, 'success');

            } catch (err) {
                console.error(err);
                showAlert(`Failed to add event. Please try again.`, 'danger');
            }
        });
    }
});
