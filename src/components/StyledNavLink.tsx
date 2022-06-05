import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/router'
import { PropsWithChildren } from 'react'
import styled, { css } from 'styled-components'
import { ConditionalWrapper } from './ConditionalWrapper'

const StyledAnchor = styled.a<{ isActive: boolean; disabled?: boolean }>`
  ${({ theme, disabled, isActive }) => css`
    white-space: nowrap;
    color: ${theme.colors.textTertiary};
    font-weight: ${theme.fontWeights.bold};
    font-size: ${theme.fontSizes.large};
    cursor: pointer;
    transition: color 0.125s ease-in-out;
    ${disabled
      ? css`
          color: ${theme.colors.textPlaceholder};
          cursor: default;
        `
      : css`
          &:hover {
            color: ${theme.colors.textSecondary};
          }
        `}
    ${isActive &&
    css`
      color: ${theme.colors.accent};
    `}
  `}
`

export const StyledNavLink = ({
  children,
  disabled,
  ...props
}: PropsWithChildren<LinkProps> & {
  disabled?: boolean
}) => {
  const router = useRouter()
  return (
    <ConditionalWrapper
      condition={!disabled}
      wrapper={(wrapperChildren) => (
        <Link {...props} passHref>
          {wrapperChildren}
        </Link>
      )}
    >
      <StyledAnchor disabled={disabled} isActive={router.asPath === props.href}>
        {children}
      </StyledAnchor>
    </ConditionalWrapper>
  )
}
