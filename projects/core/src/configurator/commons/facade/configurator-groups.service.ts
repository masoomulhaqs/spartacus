import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { Configurator } from '../../../model/configurator.model';
import { GenericConfigurator } from '../../../model/generic-configurator.model';
import * as UiActions from '../store/actions/configurator-ui.action';
import * as ConfiguratorActions from '../store/actions/configurator.action';
import { StateWithConfiguration } from '../store/configuration-state';
import { ConfiguratorCommonsService } from './configurator-commons.service';
import { ConfiguratorGroupUtilsService } from './configurator-group-utils.service';
import { ConfiguratorGroupStatusService } from './configurator-group-status.service';

/**
 * Service for handling configuration groups
 */
@Injectable()
export class ConfiguratorGroupsService {
  constructor(
    private store: Store<StateWithConfiguration>,
    private configCommonsService: ConfiguratorCommonsService,
    private configGroupUtilsService: ConfiguratorGroupUtilsService,
    private configGroupStatusService: ConfiguratorGroupStatusService
  ) {}

  subscribeToUpdateConfiguration(owner: GenericConfigurator.Owner): void {
    // TODO: Cancel previous subscriptions of the configuration state
    // Set Group Status on each update of the configuration state
    // This will be called every time something in the configuration is changed, prices,
    // attributes groups etc.
    this.configCommonsService
      .getConfiguration(owner)
      .subscribe((configuration) =>
        this.getCurrentGroup(owner)
          .pipe(take(1))
          .subscribe((currentGroup) =>
            this.configGroupStatusService.setGroupStatus(
              configuration,
              currentGroup.id,
              false
            )
          )
      );
  }

  getCurrentGroupId(owner: GenericConfigurator.Owner): Observable<string> {
    return this.configCommonsService.getUiState(owner).pipe(
      switchMap((uiState) => {
        if (uiState && uiState.currentGroup) {
          return of(uiState.currentGroup);
        } else {
          return this.configCommonsService
            .getConfiguration(owner)
            .pipe(
              map((configuration) =>
                configuration &&
                configuration.groups &&
                configuration.groups.length > 0
                  ? configuration.groups[0].id
                  : null
              )
            );
        }
      })
    );
  }

  getMenuParentGroup(
    owner: GenericConfigurator.Owner
  ): Observable<Configurator.Group> {
    return this.configCommonsService.getUiState(owner).pipe(
      map((uiState) => uiState.menuParentGroup),

      switchMap((parentGroupId) => {
        return this.configCommonsService
          .getConfiguration(owner)
          .pipe(
            map((configuration) =>
              this.configGroupUtilsService.findCurrentGroup(
                configuration.groups,
                parentGroupId
              )
            )
          );
      })
    );
  }

  setMenuParentGroup(owner: GenericConfigurator.Owner, groupId: string) {
    this.store.dispatch(new UiActions.SetMenuParentGroup(owner.key, groupId));
  }

  getCurrentGroup(
    owner: GenericConfigurator.Owner
  ): Observable<Configurator.Group> {
    return this.getCurrentGroupId(owner).pipe(
      switchMap((currentGroupId) => {
        if (!currentGroupId) {
          return of(null);
        }
        return this.configCommonsService
          .getConfiguration(owner)
          .pipe(
            map((configuration) =>
              this.configGroupUtilsService.findCurrentGroup(
                configuration.groups,
                currentGroupId
              )
            )
          );
      })
    );
  }

  navigateToGroup(configuration: Configurator.Configuration, groupId: string) {
    //Set Group status for current group
    this.getCurrentGroup(configuration.owner)
      .pipe(take(1))
      .subscribe((currentGroup) => {
        this.configGroupStatusService.setGroupStatus(
          configuration,
          currentGroup.id,
          true
        );
      });

    const parentGroup = this.configGroupUtilsService.findParentGroup(
      configuration.groups,
      this.configGroupUtilsService.findCurrentGroup(
        configuration.groups,
        groupId
      ),
      null
    );

    this.store.dispatch(
      new ConfiguratorActions.ChangeGroup(
        configuration,
        groupId,
        parentGroup ? parentGroup.id : null
      )
    );
  }

  setCurrentGroup(owner: GenericConfigurator.Owner, groupId: string) {
    this.store.dispatch(new UiActions.SetCurrentGroup(owner.key, groupId));
  }

  getNextGroupId(owner: GenericConfigurator.Owner): Observable<string> {
    return this.getCurrentGroupId(owner).pipe(
      switchMap((currentGroupId) => {
        if (!currentGroupId) {
          return of(null);
        }

        return this.configCommonsService.getConfiguration(owner).pipe(
          map((configuration) => {
            let nextGroup = null;
            configuration.flatGroups.forEach((group, index) => {
              if (
                group.id === currentGroupId &&
                configuration.flatGroups[index + 1] //Check if next group exists
              ) {
                nextGroup = configuration.flatGroups[index + 1].id;
              }
            });
            return nextGroup;
          }),
          take(1)
        );
      })
    );
  }

  getPreviousGroupId(owner: GenericConfigurator.Owner): Observable<string> {
    return this.getCurrentGroupId(owner).pipe(
      switchMap((currentGroupId) => {
        if (!currentGroupId) {
          return of(null);
        }

        return this.configCommonsService.getConfiguration(owner).pipe(
          map((configuration) => {
            let nextGroup = null;
            configuration.flatGroups.forEach((group, index) => {
              if (
                group.id === currentGroupId &&
                configuration.flatGroups[index - 1] //Check if previous group exists
              ) {
                nextGroup = configuration.flatGroups[index - 1].id;
              }
            });
            return nextGroup;
          }),
          take(1)
        );
      })
    );
  }
}
