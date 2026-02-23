import {
  ButtonGroup,
  Pagination as ChakraPagination,
  HStack,
  IconButton,
  Input,
  Popover,
  Portal,
  Text,
} from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface PaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  setSearchParams: (params: Record<string, string>) => void;
  jumpValue: number;
  setJumpValue: React.Dispatch<React.SetStateAction<number>>;
  openEllipsisIndex: number | null;
  setOpenEllipsisIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

export const Pagination = ({
  totalItems,
  pageSize,
  currentPage,
  setSearchParams,
  jumpValue,
  setJumpValue,
  openEllipsisIndex,
  setOpenEllipsisIndex,
}: PaginationProps) => {
  const paginate = (value: number | string) => {
    setSearchParams({ page: value.toString() });
  };

  return (
    <ChakraPagination.Root
      count={totalItems}
      pageSize={pageSize}
      page={currentPage}
      onPageChange={(e) => paginate(e.page)}
    >
      <ButtonGroup variant="outline" attached size="md">
        <ChakraPagination.PrevTrigger asChild>
          <IconButton>
            <LuChevronLeft />
          </IconButton>
        </ChakraPagination.PrevTrigger>

        <ChakraPagination.Context>
          {({ pages }) => {
            const lastPage =
              pages.filter((i) => i.type === "page").at(-1)?.value ?? 0;

            return pages.map((page, index) => {
              if (page.type === "page") {
                return (
                  <ChakraPagination.Item key={index} {...page} asChild>
                    <IconButton
                      variant={{ base: "outline", _selected: "solid" }}
                      borderRadius={0}
                    >
                      {page.value}
                    </IconButton>
                  </ChakraPagination.Item>
                );
              }

              if (page.type === "ellipsis") {
                return (
                  <Popover.Root
                    positioning={{ placement: "top" }}
                    onOpenChange={(open) => {
                      setOpenEllipsisIndex(open ? index : null);
                    }}
                  >
                    <Popover.Trigger asChild>
                      <ChakraPagination.Ellipsis
                        key={index}
                        index={index}
                        asChild
                      >
                        <IconButton variant="outline" borderRadius={0}>
                          …
                        </IconButton>
                      </ChakraPagination.Ellipsis>
                    </Popover.Trigger>
                    <Portal>
                      <Popover.Positioner>
                        <Popover.Content bg={"gray.800"} width={"auto"}>
                          <Popover.Body width={"auto"}>
                            <HStack width={"min-content"}>
                              <Input
                                value={jumpValue}
                                onFocus={(e) => e.currentTarget.select()}
                                onChange={(e) =>
                                  setJumpValue(Number(e.currentTarget.value))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    if (
                                      jumpValue > 0 &&
                                      jumpValue <= lastPage
                                    ) {
                                      setOpenEllipsisIndex(null);
                                      paginate(jumpValue);
                                    }
                                  }
                                }}
                                onBlur={(e) => {
                                  const value = parseInt(
                                    e.currentTarget.value,
                                    10
                                  );
                                  if (
                                    !isNaN(value) &&
                                    value > 0 &&
                                    value <= lastPage
                                  ) {
                                    paginate(value);
                                  }
                                  setOpenEllipsisIndex(null);
                                }}
                                w="60px"
                              />
                              <Text
                                width={"max-content"}
                              >{`of ${lastPage}`}</Text>
                            </HStack>
                          </Popover.Body>
                        </Popover.Content>
                      </Popover.Positioner>
                    </Portal>
                  </Popover.Root>
                );
              }

              return null;
            });
          }}
        </ChakraPagination.Context>

        <ChakraPagination.NextTrigger asChild>
          <IconButton>
            <LuChevronRight />
          </IconButton>
        </ChakraPagination.NextTrigger>
      </ButtonGroup>
    </ChakraPagination.Root>
  );
};
