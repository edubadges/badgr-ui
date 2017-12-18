import { LearningPathway, LearningPathwayElement } from "./pathway.model";
import { EntityRef } from "../../common/model/entity-ref";
export class PathwayEarnerProgressDetail {
	earnedBadgeIds: string[] = [];
	requiredBadgeIds: string[] = [];

	elementProgressMap: {[id: string]: PathwayElementEarnerProgressDetail} = {};

	static computeForPathway(
		pathway: LearningPathway,
		badgeIds: string[]
 	) {
		const pathwayProgress = new PathwayEarnerProgressDetail();
		const overallRequiredBadgeIds = new Set<string>();
		const elemProgresses: PathwayElementEarnerProgressDetail[] = [];

		function elementRequiredBadgeIds(elem: LearningPathwayElement) {
			const requiredIds = elem.requirements.requiredBadgeIds || [];
			requiredIds.forEach(id => overallRequiredBadgeIds.add(id));

			if (elem.requirements.junctionType == "Disjunction") {
				// If one of the required IDs has been required, then we only declare that requirement
				// Otherwise, we'll just declare the first one... which is kind of a hack but it will give basically accurate percentages for demoing
				const completedId = requiredIds.find(requiredId => badgeIds.indexOf(requiredId) >= 0);
				if (completedId) {
					return [ completedId ];
				} else {
					return requiredIds.length ? requiredIds.slice(1) : [];
				}
			}

			return requiredIds;
		}

		function checkElement(elem: LearningPathwayElement): PathwayElementEarnerProgressDetail {
			const requiredIds = elem.children.reduce(
				(ids: Set<string>, c) => {
					checkElement(c).requiredBadgeIds.forEach(id => ids.add(id));
					return ids;
				},
				new Set<string>(elementRequiredBadgeIds(elem))
			);
			const elemProgress = new PathwayElementEarnerProgressDetail(
				elem,
				pathwayProgress,
				Array.from(requiredIds)
			);
			pathwayProgress.elementProgressMap[ elem.id ] = elemProgress;
			elemProgresses.push(elemProgress);

			return elemProgress;
		}

		checkElement(pathway.structure.rootElement);
		pathwayProgress.requiredBadgeIds = Array.from(overallRequiredBadgeIds);
		pathwayProgress.earnedBadgeIds = badgeIds.filter(id => overallRequiredBadgeIds.has(id));

		for (let i=0; i<20 && elemProgresses.filter(p => ! p.complete).reduce((earnedBadgeListModified,e) => {
			if (e.recompute()) {
				const badgeId = e.element.completionBadge.entityRef && EntityRef.urlForRef(e.element.completionBadge.entityRef);
				if (badgeId && overallRequiredBadgeIds.has(badgeId) && pathwayProgress.earnedBadgeIds.indexOf(badgeId) < 0) {
					pathwayProgress.earnedBadgeIds.push(badgeId);
					return true;
				}
				return earnedBadgeListModified;
			}
			return earnedBadgeListModified;
		}, false); i++);

		return pathwayProgress;
	}
}

export class PathwayElementEarnerProgressDetail {
	earnedBadgeIds: string[];
	complete: boolean = false;

	constructor(
		public element: LearningPathwayElement,
		public pathwayProgress: PathwayEarnerProgressDetail,
		public requiredBadgeIds: string[]
	) {}

	recompute() {
		const wasComplete = this.complete;

		this.earnedBadgeIds = this.pathwayProgress.earnedBadgeIds.filter(id => this.requiredBadgeIds.indexOf(id) >= 0);
		this.complete = (this.requiredBadgeIds.length > 0 && this.earnedBadgeIds.length == this.requiredBadgeIds.length);

		return !wasComplete && this.complete;
	}

	get progressFraction() {
		return this.isCompletable
			? this.earnedBadgeIds.length / this.requiredBadgeIds.length
			: 0;
	}

	get isCompletable() {
		return this.requiredBadgeIds.length > 0;
	}

	hasCompletedBadgeId(badgeId: string) {
		return this.pathwayProgress.earnedBadgeIds.indexOf(badgeId) >= 0;
	}

	needsBadgeId(badgeId: string) {
		return ! this.hasCompletedBadgeId(badgeId) && this.earnedBadgeIds.indexOf(badgeId) < 0;
	}
}

export interface PathwayElementGroupProgress {
	zeroEarnerCount: number;
	nonZeroIncompleteEarnerCount: number;
	completeEarnerCount: number;

	histogram: {
		upperFraction: number;
		earnerCount: number;
	}[];
}

export interface PathwayElementEarnerProgressSummary {
	earnedBadgeCount: number;
	requiredBadgeCount: number;
	completed: boolean;
}
