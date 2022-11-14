interface ForceOpenInNewTabProps {
  children: React.ReactNode;
}

// overrides an <a> tag that doesn't have target="_blank" and adds it
export const ForceOpenInNewTab = ({ children, ...props }: ForceOpenInNewTabProps) => (
  <a {...props}>{children}</a>
);
