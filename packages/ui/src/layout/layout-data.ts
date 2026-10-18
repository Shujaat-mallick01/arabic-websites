// Settings the layout needs on every page.
import { getSettings, getCategories, getPages } from '../data.ts';

export { getCategories, getPages };
export const getGeneral = () => getSettings('general');
export const getContact = () => getSettings('contact');
export const getSeoSettings = () => getSettings('seo');
