import puppeteer, { Browser } from 'puppeteer';
import type { FetchedJob } from './jobFetchers';

async function launchBrowser(): Promise<Browser> {
  return puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
  });
}

// Naukri.com scraper
export async function scrapeNaukri(
  username: string,
  password: string,
  query: string,
  location: string
): Promise<FetchedJob[]> {
  let browser: Browser | null = null;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Login
    await page.goto('https://www.naukri.com/nlogin/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('#usernameField', { timeout: 10000 });
    await page.type('#usernameField', username, { delay: 50 });
    await page.type('#passwordField', password, { delay: 50 });
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });

    // Search jobs
    const searchQuery = encodeURIComponent(query);
    const searchLocation = encodeURIComponent(location);
    await page.goto(
      `https://www.naukri.com/${searchQuery.toLowerCase().replace(/%20/g, '-')}-jobs-in-${searchLocation.toLowerCase().replace(/%20/g, '-')}`,
      { waitUntil: 'networkidle2', timeout: 30000 }
    );

    await page.waitForSelector('.srp-jobtuple-wrapper, article.jobTuple', { timeout: 15000 });

    const jobs = await page.evaluate((): Array<{
      title: string; company: string; location: string;
      url: string; salary: string; description: string;
    }> => {
      const cards = document.querySelectorAll('.srp-jobtuple-wrapper, article.jobTuple');
      return Array.from(cards).slice(0, 20).map(card => {
        const titleEl = card.querySelector('a.title, .title a');
        const companyEl = card.querySelector('a.comp-name, .company-name a');
        const locationEl = card.querySelector('.locWdth, .location span');
        const salaryEl = card.querySelector('.salary, .sal');
        const descEl = card.querySelector('.job-desc, .desc');
        return {
          title: titleEl?.textContent?.trim() || '',
          company: companyEl?.textContent?.trim() || '',
          location: locationEl?.textContent?.trim() || '',
          url: (titleEl as HTMLAnchorElement)?.href || '',
          salary: salaryEl?.textContent?.trim() || '',
          description: descEl?.textContent?.trim() || '',
        };
      }).filter(j => j.title && j.company && j.url);
    });

    return jobs.map(j => ({
      portal: 'Naukri',
      title: j.title,
      company: j.company,
      location: j.location || location,
      jobType: 'Full-time',
      description: j.description.slice(0, 2000),
      url: j.url,
      salary: j.salary || undefined,
      postedAt: new Date(),
    }));
  } catch (err) {
    console.error('Naukri scrape failed:', err);
    return [];
  } finally {
    await browser?.close();
  }
}

// Internshala scraper
export async function scrapeInternshala(
  username: string,
  password: string,
  query: string
): Promise<FetchedJob[]> {
  let browser: Browser | null = null;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Login
    await page.goto('https://internshala.com/login/student', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('#email', { timeout: 10000 });
    await page.type('#email', username, { delay: 50 });
    await page.type('#password', password, { delay: 50 });
    await page.click('#login_submit');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });

    // Search jobs
    const slug = query.toLowerCase().replace(/\s+/g, '-');
    await page.goto(`https://internshala.com/jobs/keywords-${slug}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('.individual_internship, .internship_meta', { timeout: 15000 });

    const jobs = await page.evaluate((): Array<{
      title: string; company: string; location: string; url: string; salary: string; description: string;
    }> => {
      const cards = document.querySelectorAll('.individual_internship');
      return Array.from(cards).slice(0, 20).map(card => {
        const titleEl = card.querySelector('.profile a, h3 a');
        const companyEl = card.querySelector('.company_name a, .company a');
        const locationEl = card.querySelector('.location_link span, .location span');
        const salaryEl = card.querySelector('.stipend, .salary');
        return {
          title: titleEl?.textContent?.trim() || '',
          company: companyEl?.textContent?.trim() || '',
          location: locationEl?.textContent?.trim() || 'India',
          url: (titleEl as HTMLAnchorElement)?.href || '',
          salary: salaryEl?.textContent?.trim() || '',
          description: '',
        };
      }).filter(j => j.title && j.company && j.url);
    });

    return jobs.map(j => ({
      portal: 'Internshala',
      title: j.title,
      company: j.company,
      location: j.location,
      jobType: 'Internship',
      description: j.description,
      url: j.url,
      salary: j.salary || undefined,
      postedAt: new Date(),
    }));
  } catch (err) {
    console.error('Internshala scrape failed:', err);
    return [];
  } finally {
    await browser?.close();
  }
}

// Wellfound (AngelList) scraper — uses public search, credentials just for auth token
export async function scrapeWellfound(
  username: string,
  password: string,
  query: string
): Promise<FetchedJob[]> {
  let browser: Browser | null = null;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Login
    await page.goto('https://wellfound.com/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('input[name="email"], input[type="email"]', { timeout: 10000 });
    await page.type('input[name="email"], input[type="email"]', username, { delay: 50 });
    await page.type('input[name="password"], input[type="password"]', password, { delay: 50 });
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });

    // Search jobs
    const searchQuery = encodeURIComponent(query);
    await page.goto(`https://wellfound.com/jobs?q=${searchQuery}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('[data-test="JobListing"], .job-listing', { timeout: 15000 });

    const jobs = await page.evaluate((): Array<{
      title: string; company: string; location: string; url: string; salary: string;
    }> => {
      const cards = document.querySelectorAll('[data-test="JobListing"], .styles_component__listings__item__OgRXy');
      return Array.from(cards).slice(0, 20).map(card => {
        const titleEl = card.querySelector('h2 a, .role a');
        const companyEl = card.querySelector('h3, .company-name');
        const locationEl = card.querySelector('.location, [data-test="job-location"]');
        const salaryEl = card.querySelector('.compensation, [data-test="compensation"]');
        return {
          title: titleEl?.textContent?.trim() || '',
          company: companyEl?.textContent?.trim() || '',
          location: locationEl?.textContent?.trim() || 'Remote',
          url: (titleEl as HTMLAnchorElement)?.href || '',
          salary: salaryEl?.textContent?.trim() || '',
        };
      }).filter(j => j.title && j.company && j.url);
    });

    return jobs.map(j => ({
      portal: 'Wellfound',
      title: j.title,
      company: j.company,
      location: j.location,
      jobType: 'Full-time',
      description: '',
      url: j.url.startsWith('http') ? j.url : `https://wellfound.com${j.url}`,
      salary: j.salary || undefined,
      postedAt: new Date(),
    }));
  } catch (err) {
    console.error('Wellfound scrape failed:', err);
    return [];
  } finally {
    await browser?.close();
  }
}
