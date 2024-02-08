export interface changeTagProps {
  children: React.ReactNode;
}

// overrides any tag to become a <p> tag
export const changeTagToParagraph = ({ children }: changeTagProps) => <p>{children}</p>;

// overrides any tag to become a <span> tag
export const changeTagToSpan = ({ children }: changeTagProps) => <span>{children}</span>;
