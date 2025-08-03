import { Button, ButtonGroup, HStack, IconButton } from "@chakra-ui/react";
import { useMemo } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pagesToShow = useMemo(() => {
    const delta = 2;
    const range = [];

    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    return range;
  }, [currentPage, totalPages]);

  return (
    <HStack justify="center" mt={8}>
      <ButtonGroup isAttached variant={"outline"}>
        <IconButton
          borderColor={"gray.600"}
          color={"white"}
          _hover={{ bg: "whiteAlpha.200" }}
          _active={{ bg: "gray.700" }}
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
          aria-label={"previous"}
          icon={<ChevronLeftIcon />}
        />
        {pagesToShow.map((page) => (
          <Button
            key={page}
            borderColor={"gray.600"}
            color={"white"}
            _hover={{ bg: "whiteAlpha.200" }}
            _active={{ bg: "gray.700" }}
            onClick={() => onPageChange(page)}
            isActive={page === currentPage}
          >
            {page}
          </Button>
        ))}
        <IconButton
          borderColor={"gray.600"}
          color={"white"}
          _hover={{ bg: "whiteAlpha.200" }}
          _active={{ bg: "gray.700" }}
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages}
          aria-label={"Next"}
          icon={<ChevronRightIcon />}
        />
      </ButtonGroup>
    </HStack>
  );
}
