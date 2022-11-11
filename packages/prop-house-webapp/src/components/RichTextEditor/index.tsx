import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  EditorComposer,
  Editor,
  ToolbarPlugin,
  BoldButton,
  CodeFormatButton,
  InsertDropdown,
  InsertLinkButton,
  ItalicButton,
  UnderlineButton,
  Divider,
} from 'verbum';
import { ProposalFields } from '../../utils/proposalFields';

const RichTextEditor: React.FC<{
  onDataChange: (data: Partial<ProposalFields>) => void;
}> = props => {
  const { onDataChange } = props;
  const [content, setContent] = useState('');

  const { t } = useTranslation();

  const handleOnChange = (editorState: any) => {
    const editorContent = document.querySelector('.ContentEditable__root')?.innerHTML;
    editorContent && console.log(editorContent);
    editorContent && setContent(editorContent);

    onDataChange({ what: content });
  };

  return (
    <>
      <EditorComposer>
        <Editor
          onChange={handleOnChange}
          hashtagsEnabled={true}
          placeholder={t('descriptionPlaceholder')}
        >
          <ToolbarPlugin defaultFontSize="20px" defaultFontFamily="PT Root UI">
            <BoldButton />
            <ItalicButton />
            <UnderlineButton />
            <CodeFormatButton />
            <InsertLinkButton />
            <Divider />
            <InsertDropdown enablePoll={false} enableTable={false} />
          </ToolbarPlugin>
        </Editor>
      </EditorComposer>
    </>
  );
};

export default RichTextEditor;
