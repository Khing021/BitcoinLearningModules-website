
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
      function layout() {
        const shell = document.querySelector('.shell');
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
  