import { useCallback } from 'react';
import {mapFormValuesToDbColumns} from "../utilities/main";

const useFormToDbMapper = () => {
    return useCallback(
        (formValues: FormValues) : DbColumns => mapFormValuesToDbColumns(formValues),
        []
    );
};

export default useFormToDbMapper
