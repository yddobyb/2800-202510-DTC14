document.addEventListener('DOMContentLoaded', () => {
    
    const openFilterModalBtn = document.getElementById('openFilterModalBtn');
    const filterModal = document.getElementById('filterModal');
    const filterModalSaveBtn = document.getElementById('filterModalSaveBtn');
    const filterModalResetBtn = document.getElementById('filterModalResetBtn');
    const dayDropdown = document.getElementById('dayDropdown');
    const hourDropdown = document.getElementById('hourDropdown');
    const feeRangeSlider = document.getElementById('feeRangeSlider');
    const feeValueDisplay = document.getElementById('feeValueDisplay');

    let selectedDay = 'Weekday';
    let selectedHour = '1 hour';
    let selectedFee = 1;
    
   
    if (feeRangeSlider && feeValueDisplay) {
        feeRangeSlider.addEventListener('input', () => {
            selectedFee = feeRangeSlider.value;
            feeValueDisplay.textContent = `$${selectedFee}`;

            const percent = ((selectedFee - feeRangeSlider.min) / (feeRangeSlider.max - feeRangeSlider.min)) * 100;
            feeValueDisplay.style.left = `${percent}%`;
        });
    }
   
    if (dayDropdown) {
        const dayOptions = dayDropdown.querySelectorAll('.day-option');
        const dayDisplayText = dayDropdown.querySelector('.day-display-text');
        
        dayOptions.forEach(option => {
            option.addEventListener('click', () => {
                selectedDay = option.textContent;
                if (dayDisplayText) {
                    dayDisplayText.textContent = selectedDay;
                }
             
                dayDropdown.querySelector('.dropdown-content').classList.add('hidden');
            });
        });
        
   
        dayDropdown.querySelector('.dropdown-header').addEventListener('click', () => {
            dayDropdown.querySelector('.dropdown-content').classList.toggle('hidden');
        });
    }

    if (hourDropdown) {
        const hourOptions = hourDropdown.querySelectorAll('.hour-option');
        const hourDisplayText = hourDropdown.querySelector('.hour-display-text');
        
        hourOptions.forEach(option => {
            option.addEventListener('click', () => {
                selectedHour = option.textContent;
                if (hourDisplayText) {
                    hourDisplayText.textContent = selectedHour;
                }
       
                hourDropdown.querySelector('.dropdown-content').classList.add('hidden');
            });
        });
            
            // Show/hide hour dropdown on click
        hourDropdown.querySelector('.dropdown-header').addEventListener('click', () => {
            hourDropdown.querySelector('.dropdown-content').classList.toggle('hidden');
        });
    }
    

    if (openFilterModalBtn && filterModal) {
        openFilterModalBtn.addEventListener('click', () => {
            filterModal.classList.remove('hidden');
        });
    }
  
    if (filterModalSaveBtn && filterModal) {
        filterModalSaveBtn.addEventListener('click', () => {

            filterModal.classList.add('hidden');
        
        });
    }

    if (filterModalResetBtn) {
        filterModalResetBtn.addEventListener('click', () => {
           
            selectedDay = 'Weekday';
            selectedHour = '1 hour';
            selectedFee = 1;
            
        
            if (dayDropdown && dayDropdown.querySelector('.day-display-text')) {
                dayDropdown.querySelector('.day-display-text').textContent = selectedDay;
            }
            
            if (hourDropdown && hourDropdown.querySelector('.hour-display-text')) {
                hourDropdown.querySelector('.hour-display-text').textContent = selectedHour;
            }
            
            if (feeRangeSlider && feeValueDisplay) {
                feeRangeSlider.value = selectedFee;
                feeValueDisplay.textContent = `$${selectedFee}`;
                feeValueDisplay.style.left = '0%';
            }
       
        });
    }

    if (filterModal) {
        filterModal.addEventListener('click', (event) => {
            if (event.target === filterModal) {
                filterModal.classList.add('hidden');
            }
        });
    }
    
 
    document.addEventListener('click', (event) => {
        if (dayDropdown && !dayDropdown.contains(event.target)) {
            dayDropdown.querySelector('.dropdown-content').classList.add('hidden');
        }
        
        if (hourDropdown && !hourDropdown.contains(event.target)) {
            hourDropdown.querySelector('.dropdown-content').classList.add('hidden');
        }
    });
}); 