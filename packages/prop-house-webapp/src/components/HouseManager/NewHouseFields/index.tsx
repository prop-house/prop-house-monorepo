import classes from './NewHouseFields.module.css';
import Group from '../Group';
import Text from '../Text';
import { FC, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { capitalize } from '../../../utils/capitalize';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const NewHouseFields: FC<{
  title: string;
  description: string;
  errors: { title?: string; description?: string };
  handleBlur: (field: 'title' | 'description') => void;
  handleChange: (field: 'title' | 'description', value: string) => void;
  handleDescriptionChange: (value: string) => void;
}> = props => {
  const { title, description, errors, handleBlur, handleChange, handleDescriptionChange } = props;

  let quillRef = useRef<ReactQuill>(null);
  var icons = Quill.import('ui/icons');
  icons['undo'] = `<svg viewbox="0 0 18 18">
  <polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon>
  <path class="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"></path>
</svg>`;
  icons['redo'] = `<svg viewbox="0 0 18 18">
  <polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon>
  <path class="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path>
</svg>`;

  const handleUndo = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      // @ts-ignore
      if (quill) quill.history.undo();
    }
  };

  const handleRedo = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      // @ts-ignore
      if (quill) quill.history.redo();
    }
  };
  const modules = useMemo(
    () => ({
      toolbar: {
        handlers: { undo: handleUndo, redo: handleRedo },
        container: [
          ['undo', 'redo'],
          ['bold', 'italic', 'link'],
        ],
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [],
  );

  const formats = ['bold', 'italic', 'link'];

  return (
    <Group classNames={classes.container}>
      <Group gap={8} mb={16}>
        <div className={classes.descriptionTitile}>
          <Text type="subtitle">House name</Text>
          <Text type="body">{title.length}/255</Text>
        </div>

        <input
          className={clsx(classes.input, errors.title && classes.inputError)}
          type="text"
          placeholder={'Nouns'}
          maxLength={255}
          id="title"
          value={title}
          onChange={e => handleChange('title', e.target.value)}
          onBlur={() => handleBlur('title')}
        />

        {errors.title && (
          <Group mt={-8}>
            <p className={classes.error}>{errors.title}</p>
          </Group>
        )}
      </Group>

      <Group gap={8}>
        <div className={classes.descriptionTitile}>
          <Text type="subtitle">Describe your house</Text>
          <Text type="body">{description.length}</Text>
        </div>

        <Group classNames={classes.houseManagerEditor} mt={20}>
          <ReactQuill
            value={description}
            className={clsx(errors.description && classes.editorError)}
            onChange={handleDescriptionChange}
            onBlur={() => handleBlur('description')}
            placeholder={
              'Describe the House. Think about the goals, timeline and how you will encourage builders to participate.'
            }
            modules={modules}
            formats={formats}
            ref={quillRef}
          />
        </Group>

        {errors.description && (
          <Group mt={-8}>
            <p className={classes.error}>{capitalize(errors.description)}</p>
          </Group>
        )}
      </Group>
    </Group>
  );
};

export default NewHouseFields;
