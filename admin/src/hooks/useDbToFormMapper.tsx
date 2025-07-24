import { useCallback } from 'react';
import {mapDbColumnsToFormValues} from "../utilities/main";

const useDbToFormMapper = () => {
    return useCallback(
        (dbValues: DbColumns) : FormValues => mapDbColumnsToFormValues(dbValues),
        []
    );
};

export default useDbToFormMapper
