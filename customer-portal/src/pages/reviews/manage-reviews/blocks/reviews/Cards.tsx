import { CardProject } from '@/partials/cards';

interface ICardsItem {
  logo: string;
  name: string;
  description: string;
  progress?: {
    variant: string;
    value: number;
  };
  credits?: {
    denominator: number;
    numerator: number;
  };
  updateDate?: string;
  value?: number;

  footer?: string;
}

interface ICardsItems extends Array<ICardsItem> {}

const Cards = () => {
  const projects: ICardsItems = [
    {
      logo: 'plurk.svg',
      name: 'Credits',
      credits: {
        denominator: 0,
        numerator: 0
      },
      updateDate: 'July 22,2024',
      description: 'Real-time photo sharing app',
      progress: {
        variant: 'progress-primary',
        value: 55
      },
      footer: 'Monthly Service Request Credits'
    },
    {
      logo: 'telegram.svg',
      name: 'Total across areas you cover',
      value: 22,
      description: 'Short-term accommodation marketplace',

      footer: 'PAST 60 DAYS'
    },
    {
      logo: 'kickstarter.svg',
      name: 'Total across areas you cover',
      value: 22,
      description: 'Social media photo sharing',
      footer: 'PAST 60 DAYS'
    }
  ];

  const renderProject = (project: ICardsItem, index: number) => {
    return (
      <CardProject
        name={project.name}
        description={project.description}
        progress={project.progress}
        footer={project.footer}
        credits={project.credits}
        value={project.value}
        updateDate={project.updateDate}
        key={index}
      />
    );
  };

  return (
    <div className="flex flex-col items-stretch gap-5 lg:gap-7.5">
      <div id="projects_cards">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-7.5">
          {projects.map((project, index) => {
            return renderProject(project, index);
          })}
        </div>
      </div>
    </div>
  );
};

export { Cards, type ICardsItem, type ICardsItems };
