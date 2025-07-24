import { useEffect, useState } from 'react';
import { getDisplayRule, getTargetingOptions, saveDisplayRule, updateDisplayRule, getSelectedBannerData } from '../api';
import { toCamelCase } from '../utils/utils';
import useDbToFormMapper from './useDbToFormMapper';

const useDisplayRule = () => {
    const [displayRules, setDisplayRules] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null)
    const [error, setError] = useState(null);
    const [pages, setPages] = useState([])
    const [users, setUsers] = useState([])
    const mapDbToForm = useDbToFormMapper()

    const defaultSettings = {
        bannerPosition: 'top',
        bannerType: 'normal',
        buttonAction: '_self',
        showBannerOn: ['mobile', 'desktop'],
        bannerDeploy: {
          afterSeconds: false,
          afterScroll: false,
          seconds: 10,
          scroll: 10,
        },
        pageTargeting: 'all',
        userTargeting: '',
      };

    const fetchDisplayRule = async () => {
        setLoading(true);
        try {
            const rules = await getDisplayRule();
            const rulesCC = toCamelCase(rules);

            const mergedSettings = {
                ...defaultSettings,
                ...rulesCC,
                bannerDeploy: {
                  ...defaultSettings.bannerDeploy,
                  ...rulesCC.bannerDeploy,
                },
                showBannerOn: Array.isArray(rulesCC.showBannerOn) ? rulesCC.showBannerOn : defaultSettings.showBannerOn,
              };

            setDisplayRules((prev) => ({
                ...prev,
                ...mergedSettings,
              }));
        } catch (err) {
            setError('Error fetching display rules data');
        } finally {
            setLoading(false);
        }
    };

    const fetchTargetOptions =  async () => {
        setLoading(true);
        try {
            const targeting = await getTargetingOptions();
            const {pages, users} = targeting
            if(pages) {
                const pageOptions = pages.map(({ link, title }) => ({ value: link, label: title }));
                setPages(pageOptions)
            }
        } catch (err) {
            setError('Error fetching display targeting data');
        } finally {
            setLoading(false);
        }
    }

    const save = async (newBanner) => {
        setLoading(true);
        try {
            return await saveDisplayRule(newBanner);
        } catch (err) {
            setError('Error saving display rule');
        } finally {
            setLoading(false);
        }
    };

    const updateDisplayRule = async ( id, data ) => {
        setLoading(true);
        try {
            return await updateDisplayRule(id, data);
            // return await fetchDisplayRule();
        } catch (err) {
            setError('Error banner status update');
        } finally {
            setLoading(false);
        }
    };

    const getSelectedBanner = async () => {
        const bnr =  await getSelectedBannerData()
        console.log(bnr)
        setSelectedBanner(mapDbToForm(bnr).banner)
        console.log(selectedBanner)
    }

    return { displayRules, fetchDisplayRule, save, updateDisplayRule, fetchTargetOptions, users, pages, selectedBanner, getSelectedBanner };
};

export default useDisplayRule;
