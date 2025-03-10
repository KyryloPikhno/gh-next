import * as React from "react";
// components
import {
  BookIcon,
  DotFillIcon,
  EyeIcon,
  GlobeIcon,
  LinkIcon,
  ListUnorderedIcon,
  PulseIcon,
  RepoForkedIcon,
  StarFillIcon,
  StarIcon,
  TriangleDownIcon
} from "@primer/octicons-react";
import { Avatar } from "~/app/(components)/avatar";
import { Badge } from "~/app/(components)/badge";
import { CounterBadge } from "~/app/(components)/counter-badge";
import { Button } from "~/app/(components)/button";
import { Markdown } from "~/app/(components)/markdown/markdown";
import Link from "next/link";
import { Cache } from "~/app/(components)/cache/cache.server";
import { Skeleton } from "~/app/(components)/skeleton";

// utils
import { getSession } from "~/app/(actions)/auth";
import { getGithubRepoData } from "~/app/(actions)/github";
import { getRepositoryByOwnerAndName } from "~/app/(models)/repository";
import {
  AUTHOR_AVATAR_URL,
  GITHUB_AUTHOR_USERNAME,
  GITHUB_REPOSITORY_NAME
} from "~/lib/shared/constants";
import { clsx } from "~/lib/shared/utils.shared";
import { notFound } from "next/navigation";
import { CacheKeys } from "~/lib/shared/cache-keys.shared";

// types
import type { PageProps } from "~/lib/types";

export default async function RepositoryHomePage(
  props: PageProps<{
    user: string;
    repository: string;
  }>
) {
  return (
    <React.Suspense fallback={<HomePageSkeleton />}>
      <RepositoryHomePageContent params={props.params} />
    </React.Suspense>
  );
}
async function RepositoryHomePageContent({
  params
}: PageProps<{
  user: string;
  repository: string;
}>) {
  const repository = await getRepositoryByOwnerAndName(
    params.user,
    params.repository
  );

  if (!repository) {
    notFound();
  }

  const { user } = await getSession();
  const repositoryData = await getGithubRepoData();
  const hasStarred = Boolean(
    user &&
      repositoryData.stargazers.find(
        (stargazer) => user.github_id === stargazer.id.toString()
      )
  );

  return (
    <div className={clsx("flex flex-col", "sm:gap-4")}>
      <section
        id="repository-header-desktop"
        className={clsx(
          "border-b border-neutral px-8 pb-6",
          "hidden flex-wrap items-center justify-between",
          "md:flex",
          "xl:mx-8 xl:px-0"
        )}
      >
        <h1 className="flex items-center gap-3 text-xl font-semibold">
          <Avatar
            username={repository.owner.username}
            src={repository.owner.avatar_url}
            size="small"
          />
          <span>{repository.name}</span>

          <Badge
            label={repository.is_public ? "Public" : "Private"}
            className="relative top-0.5"
          />
        </h1>

        <div className="flex items-center gap-3">
          <Button
            href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}`}
            variant="subtle"
            renderLeadingIcon={(cls) => (
              <EyeIcon className={clsx(cls, "text-grey")} />
            )}
            renderTrailingIcon={(cls) => (
              <TriangleDownIcon className={clsx(cls, "text-grey")} />
            )}
          >
            Watch
            <CounterBadge count={repositoryData.watcherCount} />
          </Button>
          <Button
            href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/fork`}
            variant="subtle"
            renderLeadingIcon={(cls) => (
              <RepoForkedIcon className={clsx(cls, "text-grey")} />
            )}
            renderTrailingIcon={(cls) => (
              <TriangleDownIcon className={clsx(cls, "text-grey")} />
            )}
          >
            Fork
            <CounterBadge count={repositoryData.forkCount} />
          </Button>
          <Button
            href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}`}
            variant="subtle"
            renderLeadingIcon={(cls) =>
              hasStarred ? (
                <StarFillIcon className={clsx(cls, "text-yellow-500")} />
              ) : (
                <StarIcon className={clsx(cls, "text-grey")} />
              )
            }
            renderTrailingIcon={(cls) => (
              <TriangleDownIcon className={clsx(cls, "text-grey")} />
            )}
          >
            <span>{hasStarred ? "Starred" : "Star"}</span>
            <CounterBadge count={repositoryData.stargazerCount} />
          </Button>
        </div>
      </section>

      <section
        id="repository-header-mobile"
        className={clsx(
          "px-5 pb-6",
          "flex flex-col items-start gap-3 border-neutral",
          "sm:border-b",
          "md:hidden"
        )}
      >
        <div className="flex items-center gap-2">
          <Button
            href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}`}
            variant="subtle"
            isSquared
            renderLeadingIcon={(cls) => (
              <EyeIcon className={clsx(cls, "text-foreground")} />
            )}
          >
            <span className="sr-only">Watch</span>
          </Button>
          <Button
            href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/fork`}
            variant="subtle"
            isSquared
            renderLeadingIcon={(cls) => (
              <RepoForkedIcon className={clsx(cls, "text-foreground")} />
            )}
          >
            <span className="sr-only">Fork</span>
          </Button>
          <Button
            href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}`}
            variant="subtle"
            isSquared
            renderLeadingIcon={(cls) =>
              hasStarred ? (
                <StarFillIcon className={clsx(cls, "text-yellow-500")} />
              ) : (
                <StarIcon className={clsx(cls, "text-foreground")} />
              )
            }
          >
            <span className="sr-only">{hasStarred ? "Starred" : "Star"}</span>
          </Button>
        </div>

        <p className="text-grey">{repositoryData.description}</p>

        <div className="flex items-center gap-2 text-sm">
          <LinkIcon className="h-4 w-4 text-grey" />
          <a href={repositoryData.url} className="font-medium text-accent">
            {repositoryData.url}
          </a>
        </div>

        <ul className="flex flex-wrap items-center gap-4 text-sm">
          <li>
            <Link
              className="group flex items-center gap-2 text-grey hover:text-accent"
              href={`/${repository.owner.username}/${repository.name}/stargazers`}
            >
              <StarIcon className="h-4 w-4" />
              <div>
                <strong className="text-foreground group-hover:text-accent">
                  {repositoryData.stargazerCount}
                </strong>
                &nbsp;
                <span>stars</span>
              </div>
            </Link>
          </li>
          <li>
            <a
              className="group flex items-center gap-2 text-grey hover:text-accent"
              href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/forks`}
            >
              <RepoForkedIcon className="h-4 w-4" />
              <div>
                <strong className="text-foreground group-hover:text-accent">
                  {repositoryData.forkCount}
                </strong>
                &nbsp;
                <span>fork</span>
              </div>
            </a>
          </li>
          <li className="flex items-center gap-2 text-grey">
            <EyeIcon className="h-4 w-4" />
            <div>
              <strong className="text-foreground">
                {repositoryData.watcherCount}
              </strong>
              &nbsp;
              <span>watching</span>
            </div>
          </li>
          <li>
            <a
              className="group flex items-center gap-2 text-grey hover:text-accent"
              href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/pulse`}
            >
              <PulseIcon className="h-4 w-4" />
              <span>Activity</span>
            </a>
          </li>
        </ul>

        <div className="flex items-center gap-2 text-grey text-sm">
          <GlobeIcon className="h-4 w-4" />
          <span>{repository.is_public ? "Pulic " : "Private "} repository</span>
        </div>
      </section>

      <section
        id="body"
        className={clsx(
          "items-start gap-4 md:grid",
          "sm:px-5",
          "md:grid-cols-11 md:px-8",
          "lg:grid-cols-[repeat(13,_minmax(0,_1fr))]",
          "xl:grid-cols-[repeat(15,_minmax(0,_1fr))]"
        )}
      >
        <ReadmeContent
          className="w-full md:col-span-7 lg:col-span-9 xl:col-span-11"
          user={repository.owner.username}
          repository={repository.name}
        />

        <aside
          className={clsx(
            "sticky top-4 col-span-4 hidden flex-col gap-6",
            "md:flex"
          )}
        >
          <div className="flex flex-col items-start gap-4 border-b border-neutral pb-6">
            <h2 className="font-semibold">About</h2>
            <p>{repositoryData.description}</p>

            <div className="flex items-center gap-3 text-sm">
              <LinkIcon className="h-4 w-4" />
              <a
                href={repositoryData.url}
                target="_blank"
                className="font-semibold text-accent"
                rel="noreferrer"
              >
                {repositoryData.url}
              </a>
            </div>

            <ul className="flex flex-col items-start gap-2.5 text-sm">
              <li>
                <a
                  href="#readme"
                  className="flex items-center gap-3 text-grey hover:text-accent"
                >
                  <BookIcon className="h-4 w-4" />
                  <span>Readme</span>
                </a>
              </li>

              <li>
                <a
                  href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/pulse`}
                  className="flex items-center gap-3 text-grey hover:text-accent"
                >
                  <PulseIcon className="h-4 w-4" />
                  <span>Activity</span>
                </a>
              </li>

              <li>
                <Link
                  href={`/${params.user}/${params.repository}/stargazers`}
                  className="flex items-center gap-3 text-grey hover:text-accent"
                >
                  <StarIcon className="h-4 w-4" />

                  <div>
                    <strong>{repositoryData.stargazerCount}</strong>
                    &nbsp;
                    <span>stars</span>
                  </div>
                </Link>
              </li>

              <li className="flex items-center gap-3 text-grey">
                <EyeIcon className="h-4 w-4" />
                <div>
                  <strong>{repositoryData.watcherCount}</strong>
                  &nbsp;
                  <span>watching</span>
                </div>
              </li>

              <li className="flex items-center gap-3 text-grey">
                <a
                  href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/forks`}
                  className="flex items-center gap-3 text-grey hover:text-accent"
                >
                  <RepoForkedIcon className="h-4 w-4" />
                  <div>
                    <strong>{repositoryData.forkCount}</strong>
                    &nbsp;
                    <span>fork</span>
                  </div>
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-start pb-6">
            <h2 className="mb-4 font-semibold">Languages</h2>
            <div className="mb-2 flex h-2 w-full rounded-md">
              {repositoryData.languages.map((lang, index) => (
                <div
                  className={clsx("h-full", {
                    "rounded-l-md": index === 0,
                    "rounded-r-md":
                      index === repositoryData.languages.length - 1,
                    "border-l-2 border-neutral": index !== 0
                  })}
                  style={{
                    backgroundColor: lang.color,
                    width: `${lang.percent}%`
                  }}
                  key={lang.name}
                />
              ))}
            </div>

            <ul className="flex flex-wrap items-start gap-2 text-xs">
              {repositoryData.languages.map((lang) => (
                <li key={lang.color} className="flex items-center gap-1">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      color: lang.color
                    }}
                  >
                    <DotFillIcon className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">{lang.name}</span>
                  <span className="text-grey">{lang.percent}%</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}

async function ReadmeContent(props: {
  className?: string;
  user: string;
  repository: string;
}) {
  const { readmeContent, updatedAt } = await getGithubRepoData();
  const THIRTY_MINUTES_IN_SECONDS = 30 * 60;

  return (
    <div className={props.className}>
      <div
        className={clsx(
          "flex items-center gap-2 border border-neutral p-3",
          "sticky -top-1 z-10 bg-backdrop",
          "sm:rounded-t-md"
        )}
      >
        <button className="flex items-center justify-center rounded-md p-2 hover:bg-neutral/50">
          <ListUnorderedIcon className="h-3.5 w-3.5 text-grey" />
        </button>
        <h2
          className="scroll-mt-10 text-sm font-semibold hover:text-accent hover:underline"
          id="readme"
        >
          <Link href="#readme">README.md</Link>
        </h2>
      </div>

      <div
        className={clsx(
          "border-b border-l border-r border-neutral p-4",
          "sm:rounded-b-md"
        )}
      >
        <Cache
          id={CacheKeys.readme(props.user, props.repository)}
          updatedAt={updatedAt}
          ttl={THIRTY_MINUTES_IN_SECONDS}
        >
          <Markdown
            linkHeaders
            content={readmeContent}
            className="w-full max-w-full px-8 pb-8 pt-4 text-base"
          />
        </Cache>
      </div>
    </div>
  );
}

function HomePageSkeleton() {
  return (
    <div className={clsx("flex flex-col", "sm:gap-4")}>
      <section
        id="repository-header-desktop"
        className={clsx(
          "border-b border-neutral px-8 pb-6",
          "hidden flex-wrap items-center justify-between",
          "md:flex",
          "xl:mx-8 xl:px-0"
        )}
      >
        <h1 className="flex items-center gap-3 text-2xl font-semibold">
          <Avatar
            username={GITHUB_AUTHOR_USERNAME}
            src={AUTHOR_AVATAR_URL}
            size="small"
          />
          <span>gh-next</span>

          <Badge label="Public" />
        </h1>

        <div className="flex items-center gap-3">
          <Button
            href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}`}
            variant="subtle"
            renderLeadingIcon={(cls) => (
              <EyeIcon className={clsx(cls, "text-grey")} />
            )}
            renderTrailingIcon={(cls) => (
              <TriangleDownIcon className={clsx(cls, "text-grey")} />
            )}
          >
            Watch
            <CounterBadge />
          </Button>
          <Button
            href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/fork`}
            variant="subtle"
            renderLeadingIcon={(cls) => (
              <RepoForkedIcon className={clsx(cls, "text-grey")} />
            )}
            renderTrailingIcon={(cls) => (
              <TriangleDownIcon className={clsx(cls, "text-grey")} />
            )}
          >
            Fork
            <CounterBadge />
          </Button>
          <Button
            href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}`}
            variant="subtle"
            renderLeadingIcon={(cls) => (
              <StarIcon className={clsx(cls, "text-grey")} />
            )}
            renderTrailingIcon={(cls) => (
              <TriangleDownIcon className={clsx(cls, "text-grey")} />
            )}
          >
            <span>Star</span>
            <CounterBadge />
          </Button>
        </div>
      </section>

      <section
        id="repository-header-mobile"
        className={clsx(
          "px-5 pb-6",
          "flex flex-col items-start gap-5 border-neutral",
          "sm:border-b",
          "md:hidden"
        )}
      >
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>

        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-72" />

        <ul className="flex flex-wrap items-center gap-4">
          <li>
            <Skeleton className="h-5 w-20" />
          </li>
          <li>
            <Skeleton className="h-5 w-20" />
          </li>
          <li>
            <Skeleton className="h-5 w-20" />
          </li>
          <li>
            <Skeleton className="h-5 w-20" />
          </li>
        </ul>
        <Skeleton className="h-4 w-60" />
      </section>

      <section
        id="body"
        className={clsx(
          "items-start gap-4 md:grid",
          "sm:px-5",
          "md:grid-cols-11 md:px-8",
          "lg:grid-cols-[repeat(13,_minmax(0,_1fr))]",
          "xl:grid-cols-[repeat(15,_minmax(0,_1fr))]"
        )}
      >
        <div
          id="readme-content"
          className="w-full md:col-span-7 lg:col-span-9 xl:col-span-11"
        >
          <div
            className={clsx(
              "flex items-center gap-2 border border-neutral p-4",
              "sticky -top-1 z-10 bg-backdrop",
              "sm:rounded-t-md"
            )}
          >
            <button className="flex items-center justify-center rounded-md p-2 hover:bg-neutral/50">
              <Skeleton className="h-6 w-6" />
            </button>
            <h2
              className="scroll-mt-10 text-base font-semibold hover:text-accent hover:underline"
              id="readme"
            >
              <Skeleton className="h-6 w-20" />
            </h2>
          </div>

          <div
            className={clsx(
              "border-b border-l border-r border-neutral p-4",
              "flex flex-col gap-4 sm:rounded-b-md"
            )}
          >
            <Skeleton className="h-10 w-full" />

            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full md:h-48" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>

        <aside
          className={clsx(
            "sticky top-4 col-span-4 hidden flex-col gap-6",
            "md:flex"
          )}
        >
          <div className="flex flex-col items-start gap-5 border-b border-neutral pb-6">
            <Skeleton className="h-6 w-16" />

            <div className="flex w-full flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-16" />
            </div>

            <Skeleton className="h-4 w-full" />

            <ul className="flex flex-col items-start gap-3">
              <li>
                <Skeleton className="h-5 w-24" />
              </li>

              <li>
                <Skeleton className="h-5 w-24" />
              </li>

              <li>
                <Skeleton className="h-5 w-24" />
              </li>

              <li className="flex items-center gap-3 text-grey">
                <Skeleton className="h-5 w-28" />
              </li>

              <li className="flex items-center gap-3 text-grey">
                <Skeleton className="h-5 w-24" />
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-start pb-6">
            <Skeleton className="mb-5 h-6 w-36" />
            <Skeleton className="mb-3 h-2 w-full" />

            <div className="grid w-full grid-cols-2 gap-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
