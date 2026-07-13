import {
  forwardRef,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { FiLoader } from "react-icons/fi";
import {
  buttonClassNames,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/ui/buttonStyles";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  ripple?: boolean;
};

type RippleState = {
  key: number;
  x: number;
  y: number;
  size: number;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      type = "button",
      isLoading = false,
      disabled,
      leadingIcon,
      trailingIcon,
      ripple = true,
      onPointerDown,
      ...props
    },
    ref,
  ) => {
    const [activeRipple, setActiveRipple] = useState<RippleState | null>(null);
    const rippleKey = useRef(0);

    const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
      onPointerDown?.(event);
      if (!ripple || disabled || isLoading || event.defaultPrevented) return;

      const bounds = event.currentTarget.getBoundingClientRect();
      const rippleSize = Math.max(bounds.width, bounds.height) * 1.7;
      rippleKey.current += 1;
      setActiveRipple({
        key: rippleKey.current,
        x: event.clientX - bounds.left - rippleSize / 2,
        y: event.clientY - bounds.top - rippleSize / 2,
        size: rippleSize,
      });
    };

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClassNames({ variant, size, className })}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        onPointerDown={handlePointerDown}
        {...props}
      >
        {activeRipple && (
          <span
            key={activeRipple.key}
            className="button-ripple"
            style={
              {
                left: activeRipple.x,
                top: activeRipple.y,
                width: activeRipple.size,
                height: activeRipple.size,
              } as CSSProperties
            }
            aria-hidden="true"
            onAnimationEnd={() => setActiveRipple(null)}
          />
        )}
        {isLoading ? (
          <FiLoader className="relative z-[1] size-4 animate-spin" aria-hidden="true" />
        ) : (
          leadingIcon
        )}
        <span className="relative z-[1]">{children}</span>
        {!isLoading && trailingIcon}
      </button>
    );
  },
);

Button.displayName = "Button";

export const PrimaryButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
  (props, ref) => <Button ref={ref} variant="primary" {...props} />,
);
PrimaryButton.displayName = "PrimaryButton";

export const SecondaryButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
  (props, ref) => <Button ref={ref} variant="secondary" {...props} />,
);
SecondaryButton.displayName = "SecondaryButton";

export const OutlineButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
  (props, ref) => <Button ref={ref} variant="outline" {...props} />,
);
OutlineButton.displayName = "OutlineButton";
