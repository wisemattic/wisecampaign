import React, { useEffect, useState } from "react";
import InputField from "../../../../components/Common/InputField";
import TypographySetting from "../../../../components/TypographySetting";
import DesignSetting from "../../../../components/DesignSetting";
import ButtonStyleSelector from "../../../../components/ButtonStyleSelector";

interface Props {
  formValues: FormValues;
  handleChange: (
    section: keyof FormValues["banner"],
    key: string
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ButtonSection: React.FC<Props> = ({
  formValues,
  handleChange,
}) => {

  return (
    <section className="grid grid-cols-1 gap-4 ml-5 mr-5">
      <ButtonStyleSelector/>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Text"
          value={formValues.banner.button.text}
          type="text"
          onChange={handleChange("button", "text")}
        />

        <InputField
          label="Link"
          value={formValues.banner.button.link}
          type="text"
          onChange={handleChange("button", "link")}
        />
      </div>

      <TypographySetting
        formValues={formValues}
        handleChange={handleChange}
        component="button"
        excludeFields={["align"]}
      />

      <DesignSetting
        formValues={formValues}
        handleChange={handleChange}
        component="button"
      />
    </section>
  );
};
