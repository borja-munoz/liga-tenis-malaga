import { useMemo } from "react";
import { useIntl } from "react-intl";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

import { Player, usePlayers } from "../models/model";
import { CloseIcon, SearchIcon } from "./Icons";

// Accent- and case-insensitive by default ("munoz" finds "Muñoz")
const filterOptions = createFilterOptions<Player>({ limit: 50 });

interface PlayerSearchProps {
  id: string;
  label: string;
  /** Keep the label for screen readers only */
  hideLabel?: boolean;
  value: number | null;
  onSelect: (player: Player) => void;
  compact?: boolean;
  showIcon?: boolean;
  className?: string;
  /** Shows a clear button while a player is selected */
  onClear?: () => void;
  clearLabel?: string;
  autoFocus?: boolean;
}

export default function PlayerSearch({
  id,
  label,
  hideLabel = false,
  value,
  onSelect,
  compact = false,
  showIcon = true,
  className,
  onClear,
  clearLabel,
  autoFocus = false,
}: PlayerSearchProps) {
  const intl = useIntl();
  const { data: players } = usePlayers();
  const options = players ?? [];
  const selected = useMemo(
    () => (value == null ? null : options.find((p) => p.id === value) ?? null),
    [options, value]
  );

  return (
    <div className={className}>
      <label htmlFor={id} className={hideLabel ? "visually-hidden" : "field-label"}>
        {label}
      </label>
      <Autocomplete
        id={id}
        options={options}
        value={selected}
        onChange={(_event, player) => {
          if (player) onSelect(player);
        }}
        getOptionLabel={(p) => p.name}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        filterOptions={filterOptions}
        autoHighlight
        blurOnSelect
        noOptionsText={intl.formatMessage({ id: "search.noOptions" })}
        renderOption={(props, option) => {
          // Key by id: different players can share a name
          const { key: _key, ...rest } = props as typeof props & { key?: string };
          return (
            <li {...rest} key={option.id}>
              {option.name}
            </li>
          );
        }}
        renderInput={(params) => (
          <div
            ref={params.InputProps.ref}
            className={"search-field" + (compact ? " search-field--compact" : "")}
          >
            {showIcon && <SearchIcon size={compact ? 18 : 20} />}
            <input
              {...params.inputProps}
              type="search"
              placeholder={intl.formatMessage({ id: "search.placeholder" })}
              autoComplete="off"
              autoFocus={autoFocus}
            />
            {onClear && selected && (
              <button
                type="button"
                className="search-field__clear"
                aria-label={clearLabel ?? intl.formatMessage({ id: "search.clear" })}
                // Keep the Autocomplete from opening the list on press
                onMouseDown={(event) => event.preventDefault()}
                onClick={onClear}
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}
      />
    </div>
  );
}
