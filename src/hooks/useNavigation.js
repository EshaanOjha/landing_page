import { useEffect, useRef, useState } from 'react';

export function useNavigation() {
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);
  const [hash, setHash] = useState(() => window.location.hash);
  const leaveTimer = useRef();
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    const onBlur = () => {
      clearTimeout(leaveTimer.current);
      setHovered(null);
      setFocused(null);
    };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('blur', onBlur);
    return () => {
      clearTimeout(leaveTimer.current);
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('blur', onBlur);
    };
  }, []);
  return {
    activeId: hovered || focused, focusedId: focused, hash,
    onEnter(event, id) {
      if (event.pointerType === 'touch') return;
      clearTimeout(leaveTimer.current);
      setHovered(id);
    },
    onLeave(event) {
      if (event.pointerType === 'touch') return;
      clearTimeout(leaveTimer.current);
      leaveTimer.current = setTimeout(() => setHovered(null), 100);
    },
    onFocus(event, id) {
      if (event.currentTarget.matches(':focus-visible')) {
        clearTimeout(leaveTimer.current);
        setHovered(null);
        setFocused(id);
      }
    },
    onBlur() { setFocused(null); },
  };
}
