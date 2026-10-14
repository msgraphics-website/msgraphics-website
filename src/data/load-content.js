// Joins the section files in src/data/content/ into one `content` object.
// Array sections (services, testimonials) are stored as { "services": [...] }.
import business from './content/business.json';
import home from './content/home.json';
import services from './content/services.json';
import testimonials from './content/testimonials.json';
import unit from './content/unit.json';
import work from './content/work.json';
import about from './content/about.json';
import contact from './content/contact.json';

export default { business, home, services: services.services, testimonials: testimonials.testimonials, unit, work, about, contact };
