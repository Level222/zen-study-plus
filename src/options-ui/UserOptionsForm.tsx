import type { MuiAutoFormFieldComponents } from '@autoform/mui';
import type { AutoFormFieldComponents, AutoFormUIComponents } from '@autoform/react';
import type { FC } from 'react';
import type { UserOptions } from '../utils/sync-options';
import { AutoForm } from '@autoform/mui';
import { ZodProvider } from '@autoform/zod';
import SaveIcon from '@mui/icons-material/Save';
import { Accordion, AccordionDetails, AccordionSummary, Checkbox, Fab, FormControlLabel, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import UserOptionsWithField from './user-options-with-field';

const schema = new ZodProvider(UserOptionsWithField);

const SubmitButton: AutoFormUIComponents['SubmitButton'] = () => {
  return (
    <Fab
      type="submit"
      variant="extended"
      color="primary"
      sx={(theme) => ({ position: 'fixed', bottom: theme.spacing(2), right: theme.spacing(2) })}
    >
      <SaveIcon sx={{ mr: 1 }} />
      保存
    </Fab>
  );
};

const ObjectWrapper: AutoFormUIComponents['ObjectWrapper'] = ({ label, children }) => {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary><Typography variant="subtitle1">{label}</Typography></AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};

const customUIComponents: Partial<AutoFormUIComponents> = { SubmitButton, ObjectWrapper };

// MUI Checkbox is not showing the checkbox checked if initially set to true using setValue
// https://github.com/orgs/react-hook-form/discussions/11707
const BooleanField: AutoFormFieldComponents[string] = ({
  label,
  inputProps: { onChange, ...inputProps },
  value,
}) => {
  const [checked, setChecked] = useState(value);

  return (
    <FormControlLabel
      control={(
        <Checkbox
          checked={checked}
          onChange={(event) => {
            setChecked(event.target.checked);
            onChange?.(event);
          }}
          {...inputProps}
        />
      )}
      label={label}
    />
  );
};

const customFormComponents: Partial<typeof MuiAutoFormFieldComponents> & AutoFormFieldComponents = {
  boolean: BooleanField,
};

export type OptionsFormProps = {
  defaultValues: UserOptions;
  onSubmit: (values: UserOptions) => void;
};

const OptionsForm: FC<OptionsFormProps> = ({ defaultValues, onSubmit }) => {
  const form = useMemo(() => (
    <AutoForm
      schema={schema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      uiComponents={customUIComponents}
      formComponents={customFormComponents}
      withSubmit
    />
  ), [defaultValues, onSubmit]);

  return form;
};

export default OptionsForm;
