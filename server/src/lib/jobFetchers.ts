interface FetchedJob {
  portal: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  description: string;
  url: string;
  salary?: string;
  postedAt: Date;
}

function mapJobType(type: string): string {
  if (!type) return 'Full-time';
  const t = type.toUpperCase().replace(/[\s_-]/g, '');
  if (t === 'FULLTIME') return 'Full-time';
  if (t === 'PARTTIME') return 'Part-time';
  if (t === 'CONTRACT' || t === 'CONTRACTOR') return 'Contract';
  if (t === 'INTERN' || t === 'INTERNSHIP') return 'Internship';
  if (t === 'REMOTE') return 'Remote';
  return 'Full-time';
}

function mapPublisher(publisher: string): string {
  const p = (publisher || '').toLowerCase();
  if (p.includes('linkedin')) return 'LinkedIn';
  if (p.includes('indeed')) return 'Indeed';
  if (p.includes('naukri')) return 'Naukri';
  if (p.includes('internshala')) return 'Internshala';
  if (p.includes('wellfound') || p.includes('angel')) return 'Wellfound';
  return 'LinkedIn';
}

// JSearch via RapidAPI — covers LinkedIn, Indeed, Glassdoor
export async function fetchJSearch(query: string, location: string): Promise<FetchedJob[]> {
  const key = process.env.JSEARCH_API_KEY;
  if (!key) return [];

  try {
    const url = new URL('https://jsearch.p.rapidapi.com/search');
    url.searchParams.set('query', `${query} ${location}`);
    url.searchParams.set('num_pages', '2');
    url.searchParams.set('date_posted', 'week');

    const res = await fetch(url.toString(), {
      headers: {
        'X-RapidAPI-Key': key,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });

    if (!res.ok) { console.error('JSearch error:', res.status); return []; }
    const data = await res.json() as { data?: any[] };

    return (data.data || [])
      .filter((j: any) => j.job_title && j.employer_name && j.job_apply_link)
      .map((j: any): FetchedJob => ({
        portal: mapPublisher(j.job_publisher || ''),
        title: j.job_title,
        company: j.employer_name,
        location: j.job_city ? `${j.job_city}${j.job_country ? ', ' + j.job_country : ''}` : location,
        jobType: mapJobType(j.job_employment_type || ''),
        description: (j.job_description || '').slice(0, 2000),
        url: j.job_apply_link,
        salary: j.job_min_salary && j.job_max_salary
          ? `${j.job_salary_currency || '$'}${Math.round(j.job_min_salary).toLocaleString()} – ${Math.round(j.job_max_salary).toLocaleString()}/yr`
          : undefined,
        postedAt: j.job_posted_at_datetime_utc ? new Date(j.job_posted_at_datetime_utc) : new Date(),
      }));
  } catch (err) {
    console.error('JSearch fetch failed:', err);
    return [];
  }
}

// Adzuna API — good India coverage
export async function fetchAdzuna(query: string, location: string): Promise<FetchedJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  try {
    const url = new URL('https://api.adzuna.com/v1/api/jobs/in/search/1');
    url.searchParams.set('app_id', appId);
    url.searchParams.set('app_key', appKey);
    url.searchParams.set('what', query);
    url.searchParams.set('where', location);
    url.searchParams.set('results_per_page', '20');
    url.searchParams.set('content-type', 'application/json');

    const res = await fetch(url.toString());
    if (!res.ok) { console.error('Adzuna error:', res.status); return []; }
    const data = await res.json() as { results?: any[] };

    return (data.results || [])
      .filter((j: any) => j.title && j.redirect_url)
      .map((j: any): FetchedJob => ({
        portal: 'Naukri',
        title: j.title,
        company: j.company?.display_name || 'Unknown',
        location: j.location?.display_name || location,
        jobType: 'Full-time',
        description: (j.description || '').slice(0, 2000),
        url: j.redirect_url,
        salary: j.salary_min
          ? `₹${Math.round(j.salary_min / 100000)}L – ₹${Math.round((j.salary_max || j.salary_min) / 100000)}L/yr`
          : undefined,
        postedAt: j.created ? new Date(j.created) : new Date(),
      }));
  } catch (err) {
    console.error('Adzuna fetch failed:', err);
    return [];
  }
}

// Remotive API — free, no auth, remote jobs only
export async function fetchRemotive(query: string): Promise<FetchedJob[]> {
  try {
    const url = new URL('https://remotive.com/api/remote-jobs');
    url.searchParams.set('search', query);
    url.searchParams.set('limit', '20');

    const res = await fetch(url.toString());
    if (!res.ok) { console.error('Remotive error:', res.status); return []; }
    const data = await res.json() as { jobs?: any[] };

    return (data.jobs || [])
      .filter((j: any) => j.title && j.company_name && j.url)
      .map((j: any): FetchedJob => ({
        portal: 'Wellfound',
        title: j.title,
        company: j.company_name,
        location: 'Remote',
        jobType: 'Remote',
        description: (j.description || '').replace(/<[^>]*>/g, '').slice(0, 2000),
        url: j.url,
        salary: j.salary || undefined,
        postedAt: j.publication_date ? new Date(j.publication_date) : new Date(),
      }));
  } catch (err) {
    console.error('Remotive fetch failed:', err);
    return [];
  }
}

export type { FetchedJob };
