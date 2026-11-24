
    (function () {
      const rootStyles = getComputedStyle(document.documentElement);
      const baseWidth = parseFloat(rootStyles.getPropertyValue('--slide-width')) || 1600;
      const baseHeight = parseFloat(rootStyles.getPropertyValue('--slide-height')) || 900;
      document.querySelectorAll('.slide').forEach((slide) => {
        if (!slide.parentElement.classList.contains('slide-frame')) {
          const frame = document.createElement('div');
          frame.className = 'slide-frame';
          slide.parentNode.insertBefore(frame, slide);
          frame.appendChild(slide);
        }
      });

      function initDurationChips() {
        const bodyDefault = document.body ? parseFloat(document.body.getAttribute('data-default-duration')) : NaN;
        const defaultDuration = !isNaN(bodyDefault) && bodyDefault > 0 ? bodyDefault : 3;

        document.querySelectorAll('.slide').forEach((slide) => {
          const slideChip = slide.querySelector('.slide-chip');
          if (!slideChip || slide.querySelector('.duration-chip')) return;

          const customDuration = slide.getAttribute('data-duration') || slide.getAttribute('data-duration-minutes');
          const durationMins = customDuration ? parseFloat(customDuration) : defaultDuration;

          // Format total seconds into M:SS (e.g. 2.5 mins -> 150 secs -> 2:30, 3 mins -> 3:00)
          const totalSeconds = Math.round(durationMins * 60);
          const mins = Math.floor(totalSeconds / 60);
          const secs = totalSeconds % 60;
          const formattedTime = mins + ':' + (secs < 10 ? '0' : '') + secs;

          const durationChip = document.createElement('div');
          durationChip.className = 'duration-chip';
          durationChip.setAttribute('title', 'เวลาที่แนะนำสำหรับการสอนสไลด์นี้: ' + formattedTime + ' นาที');
          durationChip.innerHTML = '<svg class="duration-chip-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span>' + formattedTime + '</span>';

          const parent = slideChip.parentElement;
          if (parent) {
            if (!parent.classList.contains('guide-chip-row')) {
              const row = document.createElement('div');
              row.className = 'guide-chip-row';
              parent.insertBefore(row, slideChip);
              row.appendChild(slideChip);
              row.appendChild(durationChip);
            } else {
              parent.appendChild(durationChip);
            }
          }
        });
      }

      function layout() {
        initDurationChips();
        const shell = document.querySelector('.shell');
        if (!shell) return;
        const scale = shell.clientWidth / baseWidth;
        document.querySelectorAll('.slide-frame').forEach((frame) => {
          frame.style.height = String(baseHeight * scale) + 'px';
        });
        document.querySelectorAll('.slide').forEach((slide) => {
          slide.style.transform = 'scale(' + scale + ')';
        });
      }
      layout();
      window.addEventListener('resize', layout);
    })();
  