import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook quản lý trạng thái kéo thả (drag & drop) cho các bubble widget nổi
 * Hỗ trợ cả chuột (mouse) và cảm ứng (touch), tự động lưu vị trí vào localStorage,
 * và tính toán vị trí hiển thị tối ưu cho popup tương ứng với kích thước màn hình.
 */
export function useDraggableBubble({
  storageKey,
  defaultOffset = { right: 28, bottom: 28 },
  buttonSize = 58,
  popupWidth = 360,
  popupHeight = 520,
}) {
  const clamp = useCallback((val, min, max) => Math.max(min, Math.min(max, val)), []);

  const [position, setPosition] = useState(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
            return {
              x: Math.max(12, Math.min(window.innerWidth - buttonSize - 12, parsed.x)),
              y: Math.max(12, Math.min(window.innerHeight - buttonSize - 12, parsed.y)),
            };
          }
        }
      } catch {}
    }
    return {
      x: Math.max(12, window.innerWidth - buttonSize - defaultOffset.right),
      y: Math.max(12, window.innerHeight - buttonSize - defaultOffset.bottom),
    };
  });

  const positionRef = useRef(position);
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const [isDragging, setIsDragging] = useState(false);
  const dragInfoRef = useRef({
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    currentX: 0,
    currentY: 0,
    hasMoved: false,
  });
  const didDragRef = useRef(false);

  // Tự động căn chỉnh khi người dùng thay đổi kích thước trình duyệt
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const clamped = {
          x: clamp(prev.x, 12, window.innerWidth - buttonSize - 12),
          y: clamp(prev.y, 12, window.innerHeight - buttonSize - 12),
        };
        positionRef.current = clamped;
        return clamped;
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [buttonSize, clamp]);

  const startDrag = useCallback(
    (clientX, clientY) => {
      dragInfoRef.current = {
        startX: clientX,
        startY: clientY,
        originX: positionRef.current.x,
        originY: positionRef.current.y,
        currentX: positionRef.current.x,
        currentY: positionRef.current.y,
        hasMoved: false,
      };
      didDragRef.current = false;

      const onMove = (moveX, moveY) => {
        const dx = moveX - dragInfoRef.current.startX;
        const dy = moveY - dragInfoRef.current.startY;

        if (!dragInfoRef.current.hasMoved && Math.hypot(dx, dy) > 4) {
          dragInfoRef.current.hasMoved = true;
          didDragRef.current = true;
          setIsDragging(true);
        }

        if (dragInfoRef.current.hasMoved) {
          const nextX = clamp(
            dragInfoRef.current.originX + dx,
            12,
            window.innerWidth - buttonSize - 12
          );
          const nextY = clamp(
            dragInfoRef.current.originY + dy,
            12,
            window.innerHeight - buttonSize - 12
          );
          dragInfoRef.current.currentX = nextX;
          dragInfoRef.current.currentY = nextY;
          positionRef.current = { x: nextX, y: nextY };
          setPosition({ x: nextX, y: nextY });
        }
      };

      const onMouseMove = (e) => {
        onMove(e.clientX, e.clientY);
      };

      const onTouchMove = (e) => {
        if (e.touches && e.touches[0]) {
          if (dragInfoRef.current.hasMoved && e.cancelable) {
            e.preventDefault();
          }
          onMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      };

      const endDrag = () => {
        setIsDragging(false);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener('touchcancel', onTouchEnd);

        if (dragInfoRef.current.hasMoved) {
          const finalPos = {
            x: dragInfoRef.current.currentX,
            y: dragInfoRef.current.currentY,
          };
          if (storageKey) {
            try {
              localStorage.setItem(storageKey, JSON.stringify(finalPos));
            } catch {}
          }
          setTimeout(() => {
            didDragRef.current = false;
          }, 120);
        }
      };

      const onMouseUp = () => endDrag();
      const onTouchEnd = () => endDrag();

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
      window.addEventListener('touchcancel', onTouchEnd);
    },
    [buttonSize, clamp, storageKey]
  );

  const handleMouseDown = useCallback(
    (e) => {
      if (e.button && e.button !== 0) return;
      startDrag(e.clientX, e.clientY);
    },
    [startDrag]
  );

  const handleTouchStart = useCallback(
    (e) => {
      if (e.touches && e.touches[0]) {
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [startDrag]
  );

  const handleHeaderMouseDown = useCallback(
    (e) => {
      if (e.button && e.button !== 0) return;
      if (e.target.closest('button, input, textarea, a')) return;
      startDrag(e.clientX, e.clientY);
    },
    [startDrag]
  );

  const handleHeaderTouchStart = useCallback(
    (e) => {
      if (e.target.closest('button, input, textarea, a')) return;
      if (e.touches && e.touches[0]) {
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [startDrag]
  );

  const handleClickCapture = useCallback((e) => {
    if (didDragRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  // Tính toán kích thước và tọa độ thông minh cho popup
  const actualPopupWidth = Math.min(
    typeof window !== 'undefined' ? window.innerWidth - 24 : popupWidth,
    popupWidth
  );
  const actualPopupHeight = Math.min(
    typeof window !== 'undefined' ? window.innerHeight - 80 : popupHeight,
    popupHeight
  );

  const isLowerHalf =
    typeof window !== 'undefined'
      ? position.y + buttonSize / 2 > window.innerHeight / 2
      : true;
  const isRightHalf =
    typeof window !== 'undefined'
      ? position.x + buttonSize / 2 > window.innerWidth / 2
      : true;

  const idealPopupX = isRightHalf
    ? position.x + buttonSize - actualPopupWidth
    : position.x;
  const popupX =
    typeof window !== 'undefined'
      ? clamp(idealPopupX, 12, window.innerWidth - actualPopupWidth - 12)
      : 12;

  const idealPopupY = isLowerHalf
    ? position.y - actualPopupHeight - 12
    : position.y + buttonSize + 12;
  const popupY =
    typeof window !== 'undefined'
      ? clamp(idealPopupY, 12, window.innerHeight - actualPopupHeight - 12)
      : 12;

  return {
    position,
    setPosition,
    isDragging,
    popupPosition: {
      x: popupX,
      y: popupY,
      width: actualPopupWidth,
      height: actualPopupHeight,
    },
    dragProps: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
      onClickCapture: handleClickCapture,
      style: {
        touchAction: 'none',
        userSelect: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
      },
    },
    headerDragProps: {
      onMouseDown: handleHeaderMouseDown,
      onTouchStart: handleTouchStart,
      style: {
        touchAction: 'none',
        userSelect: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
      },
    },
  };
}
